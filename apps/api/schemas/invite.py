from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class InviteBase(BaseModel):
    choir_id: str
    max_uses: Optional[int] = 1
    expires_at: Optional[datetime] = None

class InviteCreate(InviteBase):
    pass

class InviteUpdate(BaseModel):
    max_uses: Optional[int] = None
    expires_at: Optional[datetime] = None

class InviteSchema(InviteBase):
    id: str
    code: str
    uses_count: int
    created_by_id: str
    
    model_config = ConfigDict(from_attributes=True)

class InviteValidateResponse(BaseModel):
    valid: bool
    choir_name: Optional[str] = None
    message: Optional[str] = None
