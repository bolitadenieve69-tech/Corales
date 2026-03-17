from typing import Optional
from pydantic import BaseModel, EmailStr
from models import UserRole

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = UserRole.CORALISTA
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    favorite_voice: Optional[str] = None
    
    dni: Optional[str] = None
    phone: Optional[str] = None
    has_whatsapp: Optional[bool] = False
    address: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str
    invite_code: Optional[str] = None

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

# Additional properties stored in DB
class UserInDBBase(UserBase):
    id: str

    class Config:
        orm_mode = True

# Properties to return via API
class User(UserInDBBase):
    pass
