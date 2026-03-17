from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from .asset import AssetSchema

class EditionBase(BaseModel):
    work_id: str
    publisher: Optional[str] = None
    notes: Optional[str] = None

class EditionCreate(EditionBase):
    pass

class EditionUpdate(BaseModel):
    publisher: Optional[str] = None
    notes: Optional[str] = None

class EditionSchema(EditionBase):
    id: str
    assets: List[AssetSchema] = []
    
    model_config = ConfigDict(from_attributes=True)
