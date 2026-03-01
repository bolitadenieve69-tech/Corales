from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .base import Base
import enum

class VoicePart(str, enum.Enum):
    SOPRANO = "SOPRANO"
    ALTO = "ALTO"
    TENOR = "TENOR"
    BASS = "BASS"
    DIRECTOR = "DIRECTOR"

class Choir(Base):
    __tablename__ = "choirs"

    name = Column(String, nullable=False)
    description = Column(String)
    max_users = Column(Integer, default=50) # New quota field
    
    # Relationships
    memberships = relationship("Membership", back_populates="choir")

class Membership(Base):
    __tablename__ = "memberships"

    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    choir_id = Column(String, ForeignKey("choirs.id"), nullable=False, index=True)
    voice_part = Column(Enum(VoicePart), nullable=False)

    # Relationships
    user = relationship("User")
    choir = relationship("Choir", back_populates="memberships")
