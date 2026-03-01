from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from models.practice_progress import PracticeStatus

class PracticeProgressBase(BaseModel):
    work_id: int
    status: PracticeStatus = PracticeStatus.NUEVA
    minutes_practiced: int = 0

class PracticeProgressCreate(PracticeProgressBase):
    pass

class PracticeProgressUpdate(BaseModel):
    status: Optional[PracticeStatus] = None
    minutes_practiced: Optional[int] = None

class PracticeProgressInDB(PracticeProgressBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PracticeProgress(PracticeProgressInDB):
    pass
