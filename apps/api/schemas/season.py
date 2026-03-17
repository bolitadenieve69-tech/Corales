from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class SeasonBase(BaseModel):
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    choir_id: str

class SeasonCreate(SeasonBase):
    pass

class SeasonUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class SeasonSchema(SeasonBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
