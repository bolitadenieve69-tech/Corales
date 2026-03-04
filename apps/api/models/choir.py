from sqlalchemy import Column, String, ForeignKey, Enum, Integer, Boolean
from sqlalchemy.orm import relationship
from .base import Base
import enum

class VoicePart(str, enum.Enum):
    SOPRANO = "SOPRANO"
    ALTO = "ALTO"
    TENOR = "TENOR"
    BASS = "BASS"
    DIRECTOR = "DIRECTOR"
    SUBDIRECTOR = "SUBDIRECTOR"

class Choir(Base):
    __tablename__ = "choirs"

    name = Column(String, nullable=False)
    description = Column(String)
    max_users = Column(Integer, default=50) # New quota field
    
    # Extra Choir Info
    social_address = Column(String, nullable=True)
    director_name = Column(String, nullable=True)
    director_phone = Column(String, nullable=True)
    subdirector_name = Column(String, nullable=True)
    subdirector_phone = Column(String, nullable=True)

    # Association Board
    president_name = Column(String, nullable=True)
    president_phone = Column(String, nullable=True)
    president_has_whatsapp = Column(Boolean, default=False)
    president_email = Column(String, nullable=True)

    secretary_name = Column(String, nullable=True)
    secretary_phone = Column(String, nullable=True)
    secretary_has_whatsapp = Column(Boolean, default=False)
    secretary_email = Column(String, nullable=True)

    treasurer_name = Column(String, nullable=True)
    treasurer_phone = Column(String, nullable=True)
    treasurer_has_whatsapp = Column(Boolean, default=False)
    treasurer_email = Column(String, nullable=True)

    other_info = Column(String, nullable=True)

    # Assets
    logo_url = Column(String, nullable=True)
    cover_photo_url = Column(String, nullable=True)

    
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
