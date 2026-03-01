import secrets
import string
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from api import deps
from core.database import get_db
from models.invite import Invite
from models.user import User
from models.choir import Membership, VoicePart
from schemas.invite import InviteCreate, InviteRedeem, Invite as InviteSchema

router = APIRouter()

def generate_code(length=8):
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

@router.post("/", response_model=InviteSchema)
def create_invite(
    *,
    db: Session = Depends(get_db),
    invite_in: InviteCreate,
    current_user: User = Depends(deps.get_current_active_director),
) -> Any:
    """
    Create new invitation code (Director only).
    """
    # Verify director has access to this choir
    membership = db.query(Membership).filter(
        Membership.user_id == current_user.id,
        Membership.choir_id == invite_in.choir_id,
        Membership.voice_part == "DIRECTOR"
    ).first()
    
    if not membership and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough privileges for this choir")
        
    db_obj = Invite(
        code=generate_code(),
        choir_id=invite_in.choir_id,
        created_by_id=current_user.id,
        max_uses=invite_in.max_uses,
        expires_at=invite_in.expires_at
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/redeem")
def redeem_invite(
    *,
    db: Session = Depends(get_db),
    redeem_in: InviteRedeem,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Redeem an invitation code to join a choir.
    """
    invite = db.query(Invite).filter(Invite.code == redeem_in.code.upper()).first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Invite code not found")
        
    if invite.expires_at and invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invite code has expired")
        
    if invite.max_uses and invite.uses_count >= invite.max_uses:
        raise HTTPException(status_code=400, detail="Invite code has reached its usage limit")
        
    try:
        voice_part_enum = VoicePart(redeem_in.voice_part.upper())
    except ValueError:
             raise HTTPException(status_code=400, detail="Invalid voice part")
             
    # Check if already a member
    existing_member = db.query(Membership).filter(
        Membership.user_id == current_user.id,
        Membership.choir_id == invite.choir_id
    ).first()
    
    if existing_member:
        return {"msg": "Already a member of this choir"}
        
    # Create membership
    membership = Membership(
        user_id=current_user.id,
        choir_id=invite.choir_id,
        voice_part=voice_part_enum
    )
    
    # Update invite uses
    invite.uses_count += 1
    
    db.add(membership)
    db.add(invite)
    
    # Optional: Update user role to CORALISTA if they were something else but it shouldn't matter as Enum default is Coralista
    
    db.commit()
    return {"msg": "Successfully joined the choir", "choir_id": invite.choir_id}
