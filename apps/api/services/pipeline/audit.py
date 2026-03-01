"""Audit logging helper for pipeline events (Tarea 11.7).

Records pipeline events to the audit_log table for debuggability:
  - JOB_STARTED / JOB_SUCCEEDED / JOB_FAILED
  - ASSET_GENERATED (type + checksum)
  - MAPPING_UPDATED
"""

import json
import logging
from sqlalchemy.orm import Session

from models.audit_log import AuditLog

logger = logging.getLogger(__name__)


def log_event(
    db: Session,
    event_type: str,
    entity_type: str,
    entity_id: str,
    details: dict = None,
    user_id: str = None,
) -> AuditLog:
    """Record a pipeline event to the audit_log table.
    
    Args:
        db: SQLAlchemy session
        event_type: e.g. "JOB_STARTED", "JOB_SUCCEEDED", "JOB_FAILED", "ASSET_GENERATED"
        entity_type: e.g. "asset", "edition"
        entity_id: ID of the entity
        details: Optional dict with extra info (serialized to JSON)
        user_id: Optional user ID (null for automatic jobs)
    """
    entry = AuditLog(
        event_type=event_type,
        entity_type=entity_type,
        entity_id=entity_id,
        user_id=user_id,
        details=json.dumps(details) if details else None,
    )
    db.add(entry)
    db.commit()
    
    logger.info(f"AUDIT: {event_type} {entity_type}:{entity_id} {details or ''}")
    return entry
