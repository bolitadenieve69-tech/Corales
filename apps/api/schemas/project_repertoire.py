from pydantic import BaseModel, ConfigDict
from typing import Optional

class ProjectRepertoireBase(BaseModel):
    project_id: str
    work_title: str
    order: int = 0

class ProjectRepertoireCreate(BaseModel):
    work_title: str
    order: Optional[int] = 0

class ProjectRepertoireUpdate(BaseModel):
    work_title: Optional[str] = None
    order: Optional[int] = None

class ProjectRepertoireSchema(ProjectRepertoireBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
