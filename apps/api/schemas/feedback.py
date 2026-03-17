from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FeedbackCreate(BaseModel):
    recipient_id: str
    work_id: Optional[str] = None
    content: str = Field(..., min_length=1, max_length=2000)

class FeedbackRead(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    choir_id: str
    work_id: Optional[str]
    content: str
    created_at: datetime
    read_at: Optional[datetime]

    class Config:
        from_attributes = True
