from sqlalchemy import Column, String, Enum, Boolean
from .base import Base
import enum

class UserRole(str, enum.Enum):
    DIRECTOR = "DIRECTOR"
    CORALISTA = "CORALISTA"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.CORALISTA, nullable=False)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    favorite_voice = Column(String, nullable=True) # e.g. 'soprano', 'alto'...

    # Personal info added for Choir management
    dni = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    has_whatsapp = Column(Boolean, default=False)
    address = Column(String, nullable=True)
