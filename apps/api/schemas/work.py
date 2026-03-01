from pydantic import BaseModel, ConfigDict
from typing import Optional, List

# Basic Edition schema to include in Works
class EditionSchemaBase(BaseModel):
    id: str
    publisher: Optional[str] = None
    notes: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class WorkBase(BaseModel):
    title: str
    composer: Optional[str] = None
    era: Optional[str] = None
    genre: Optional[str] = None
    voice_format: Optional[str] = None
    accompaniment: Optional[str] = None
    language: Optional[str] = None
    difficulty: Optional[str] = None
    choir_id: str

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
    editions: List[EditionSchemaBase] = []
    
    model_config = ConfigDict(from_attributes=True)
