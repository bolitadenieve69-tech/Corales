from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional, List
from .project_repertoire import ProjectRepertoireSchema

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    date: Optional[date] = None
    is_published: bool = False
    choir_id: str
    season_id: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[date] = None
    is_published: Optional[bool] = None
    season_id: Optional[str] = None

class ProjectSchema(ProjectBase):
    id: str
    repertoire: List[ProjectRepertoireSchema] = []

    model_config = ConfigDict(from_attributes=True)
