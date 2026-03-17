"""RQ Worker entry point for the Corales pipeline.

Start with:
    cd apps/api
    source venv/bin/activate
    python worker.py

Requires Redis running on localhost:6379 (or REDIS_URL env var).
"""

import logging
import sys
import os

# Ensure the api directory is in the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from redis import Redis
from rq import Worker, Queue
from rq.job import Retry

from core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("pipeline.worker")


def main():
    """Start the RQ worker listening on the 'pipeline' queue."""
    redis_conn = Redis.from_url(settings.REDIS_URL)

    # Test connection
    try:
        redis_conn.ping()
        logger.info(f"Connected to Redis at {settings.REDIS_URL}")
    except Exception as e:
        logger.error(f"Cannot connect to Redis: {e}")
        sys.exit(1)

    # Create queue
    queue = Queue("pipeline", connection=redis_conn)
    logger.info(f"Listening on queue: 'pipeline'")
    logger.info(f"Pipeline version: {settings.PIPELINE_VERSION}")

    # Start worker
    worker = Worker([queue], connection=redis_conn)
    worker.work()


if __name__ == "__main__":
    main()
