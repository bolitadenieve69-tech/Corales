from sqlalchemy import Column, String
from .base import Base


class AuditLog(Base):
    __tablename__ = "audit_log"

    # JOB_STARTED | JOB_SUCCEEDED | JOB_FAILED | ASSET_GENERATED | MAPPING_UPDATED
    event_type = Column(String, nullable=False, index=True)

    # Entity reference (e.g. "asset", "edition")
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False, index=True)

    # Null for automatic jobs, filled for user-triggered actions
    user_id = Column(String, nullable=True, index=True)

    # JSON details: {checksum, asset_type, error, job_id, attempt, ...}
    details = Column(String, nullable=True)
