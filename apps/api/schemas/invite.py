from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class InviteCreate(BaseModel):
    choir_id: str
    max_uses: Optional[int] = None
    expires_at: Optional[datetime] = None

class InviteRedeem(BaseModel):
    code: str
    voice_part: str

class Invite(BaseModel):
    id: str
    code: str
    choir_id: str
    max_uses: Optional[int]
    uses_count: int
    expires_at: Optional[datetime]

    class Config:
        orm_mode = True
