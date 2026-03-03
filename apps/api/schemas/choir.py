from typing import Optional, List
from pydantic import BaseModel
from datetime import date

# Season Schemas
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

    class Config:
        orm_mode = True

# Member/Management Schemas
class ChoirMemberDetail(BaseModel):
    id: str
    user_id: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: str
    voice_part: str
    avatar_url: Optional[str] = None
    
    class Config:
        orm_mode = True
