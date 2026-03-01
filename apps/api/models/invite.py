from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime

class Invite(Base):
    __tablename__ = "invites"

    code = Column(String, unique=True, index=True, nullable=False)
    choir_id = Column(String, ForeignKey("choirs.id"), nullable=False)
    created_by_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Limitations
    max_uses = Column(Integer, nullable=True) # None = unlimited
    uses_count = Column(Integer, default=0)
    expires_at = Column(DateTime(timezone=True), nullable=True) # None = never expires

    choir = relationship("Choir")
    creator = relationship("User")
