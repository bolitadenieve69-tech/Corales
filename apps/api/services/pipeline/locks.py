"""Distributed locks using Redis to prevent simultaneous duplicate processing (Tarea 11.3).

Lock keys follow the pattern:  lock:{stage}:{entity_id}
Example:  lock:process_musicxml:abc123
          lock:generate_midis:def456
          lock:render_audio:def456
"""

import redis
import logging

logger = logging.getLogger(__name__)


class PipelineLock:
    """Redis-based distributed lock for pipeline stages.
    
    Uses Redis SET NX EX for atomic acquire, ensuring only one worker
    processes a given entity at a time.
    """

    def __init__(self, redis_url: str):
        self._redis = redis.from_url(redis_url)

    def acquire(self, stage: str, entity_id: str, ttl_seconds: int = 600) -> bool:
        """Try to acquire a lock. Returns True if acquired, False if already held.
        
        Args:
            stage: Pipeline stage name (e.g. "process_musicxml")
            entity_id: The asset_id or edition_id being processed
            ttl_seconds: Time-to-live in seconds (default 10 min)
        """
        key = f"lock:{stage}:{entity_id}"
        acquired = self._redis.set(key, "1", nx=True, ex=ttl_seconds)
        if acquired:
            logger.info(f"Lock acquired: {key} (TTL={ttl_seconds}s)")
        else:
            logger.warning(f"Lock already held: {key}")
        return bool(acquired)

    def release(self, stage: str, entity_id: str) -> None:
        """Release a lock."""
        key = f"lock:{stage}:{entity_id}"
        self._redis.delete(key)
        logger.info(f"Lock released: {key}")

    def is_locked(self, stage: str, entity_id: str) -> bool:
        """Check if a lock exists (for monitoring)."""
        key = f"lock:{stage}:{entity_id}"
        return bool(self._redis.exists(key))
