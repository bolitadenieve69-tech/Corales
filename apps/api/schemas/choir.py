from typing import Optional
from pydantic import BaseModel

# Shared properties
class ChoirBase(BaseModel):
    name: str
    description: Optional[str] = None

# Properties to receive via API on creation
class ChoirCreate(ChoirBase):
    pass

# Properties to receive via API on update
class ChoirUpdate(ChoirBase):
    name: Optional[str] = None

class ChoirSchema(ChoirBase):
    id: str

    class Config:
        from_attributes = True

class MembershipSchema(BaseModel):
    user_id: str
    choir_id: str
    voice_part: str

    class Config:
        from_attributes = True
