from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from .edition import EditionSchema

class WorkBase(BaseModel):
    title: str
    composer: Optional[str] = None
    era: Optional[str] = None
    genre: Optional[str] = None
    voice_format: Optional[str] = None
    accompaniment: Optional[str] = None
    language: Optional[str] = None
    difficulty: Optional[str] = None
    choir_id: Optional[str] = None

class WorkCreate(WorkBase):
    pass

class WorkUpdate(BaseModel):
    title: Optional[str] = None
    composer: Optional[str] = None
    era: Optional[str] = None
    genre: Optional[str] = None
    voice_format: Optional[str] = None
    accompaniment: Optional[str] = None
    language: Optional[str] = None
    difficulty: Optional[str] = None

class WorkSchema(WorkBase):
    id: str
    editions: List[EditionSchema] = []
    
    model_config = ConfigDict(from_attributes=True)
