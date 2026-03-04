from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import date

# Season Schemas (Used by choir management)
class SeasonBase(BaseModel):
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class SeasonCreate(SeasonBase):
    choir_id: str

class SeasonUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class Season(SeasonBase):
    id: str
    choir_id: str

    model_config = ConfigDict(from_attributes=True)

# Choir Schemas
class ChoirBase(BaseModel):
    name: str
    description: Optional[str] = None
    max_users: Optional[int] = 50

    social_address: Optional[str] = None
    director_name: Optional[str] = None
    director_phone: Optional[str] = None
    subdirector_name: Optional[str] = None
    subdirector_phone: Optional[str] = None

    president_name: Optional[str] = None
    president_phone: Optional[str] = None
    president_has_whatsapp: Optional[bool] = False
    president_email: Optional[str] = None

    secretary_name: Optional[str] = None
    secretary_phone: Optional[str] = None
    secretary_has_whatsapp: Optional[bool] = False
    secretary_email: Optional[str] = None

    treasurer_name: Optional[str] = None
    treasurer_phone: Optional[str] = None
    treasurer_has_whatsapp: Optional[bool] = False
    treasurer_email: Optional[str] = None

    other_info: Optional[str] = None
    logo_url: Optional[str] = None
    cover_photo_url: Optional[str] = None

class ChoirCreate(ChoirBase):
    pass

class ChoirUpdate(ChoirBase):
    name: Optional[str] = None
    max_users: Optional[int] = None

class ChoirSchema(ChoirBase):
    id: str

    model_config = ConfigDict(from_attributes=True)

class ChoirAssignment(BaseModel):
    name: str
    description: Optional[str] = None
    max_users: Optional[int] = 50
    user_id: str
    role: str # DIRECTOR or SUBDIRECTOR

class ChoirMemberCreate(BaseModel):
    email: str
    full_name: str
    voice_part: str
    dni: Optional[str] = None
    phone: Optional[str] = None
    has_whatsapp: Optional[bool] = False
    address: Optional[str] = None

# Member/Management Schemas
class ChoirMemberDetail(BaseModel):
    id: str
    user_id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    voice_part: str
    avatar_url: Optional[str] = None
    
    dni: Optional[str] = None
    phone: Optional[str] = None
    has_whatsapp: Optional[bool] = False
    address: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
