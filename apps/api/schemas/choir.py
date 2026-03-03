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

class ChoirCreate(ChoirBase):
    pass

class ChoirUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
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

# Member/Management Schemas
class ChoirMemberDetail(BaseModel):
    id: str
    user_id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    voice_part: str
    avatar_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
