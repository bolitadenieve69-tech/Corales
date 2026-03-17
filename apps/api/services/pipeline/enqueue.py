"""Helper to enqueue pipeline jobs from API endpoints.

Provides a clean interface for endpoints to dispatch jobs to the RQ queue
with proper retry configuration and error handling.
"""

import logging
from redis import Redis
from rq import Queue
from rq.job import Retry

from core.config import settings
from services.pipeline.jobs import RETRY_DELAYS, MAX_RETRIES

logger = logging.getLogger(__name__)


def _get_queue() -> Queue:
    """Get or create the pipeline RQ queue."""
    redis_conn = Redis.from_url(settings.REDIS_URL)
    return Queue("pipeline", connection=redis_conn)


def enqueue_process_musicxml(asset_id: str) -> str:
    """Enqueue a MusicXML processing job.
    
    Args:
        asset_id: The asset to process
        
    Returns:
        The RQ job ID
    """
    queue = _get_queue()
    job = queue.enqueue(
        "services.pipeline.jobs.process_musicxml",
        asset_id,
        retry=Retry(max=MAX_RETRIES, interval=RETRY_DELAYS),
        job_timeout="10m",
    )
    logger.info(f"Enqueued process_musicxml for asset {asset_id}, job_id={job.id}")
    return job.id


def enqueue_generate_midis(edition_id: str) -> str:
    """Enqueue a MIDI generation job.
    
    Args:
        edition_id: The edition to generate MIDIs for
        
    Returns:
        The RQ job ID
    """
    queue = _get_queue()
    job = queue.enqueue(
        "services.pipeline.jobs.generate_midis",
        edition_id,
        retry=Retry(max=MAX_RETRIES, interval=RETRY_DELAYS),
        job_timeout="15m",
    )
    logger.info(f"Enqueued generate_midis for edition {edition_id}, job_id={job.id}")
    return job.id


def enqueue_render_audio(edition_id: str) -> str:
    """Enqueue an audio rendering job.
    
    Args:
        edition_id: The edition to render audio for
        
    Returns:
        The RQ job ID
    """
    queue = _get_queue()
    job = queue.enqueue(
        "services.pipeline.jobs.render_audio",
        edition_id,
        retry=Retry(max=MAX_RETRIES, interval=RETRY_DELAYS),
        job_timeout="30m",
    )
    logger.info(f"Enqueued render_audio for edition {edition_id}, job_id={job.id}")
    return job.id
