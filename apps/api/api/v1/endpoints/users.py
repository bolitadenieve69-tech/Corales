from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api import deps
from core.database import get_db
from core.security import get_password_hash
from models.user import User
from schemas.user import User as UserSchema, UserCreate

router = APIRouter()

@router.post("/", response_model=UserSchema)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    from models.invite import Invite
    from models.choir import Membership, VoicePart
    import uuid

    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    # Process invite code if provided
    invite = None
    if user_in.invite_code:
        invite = db.query(Invite).filter(Invite.code == user_in.invite_code).first()
        if not invite:
            raise HTTPException(status_code=400, detail="Código de invitación no válido")
        
        # Check if invite is active
        from datetime import datetime
        if invite.expires_at and invite.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="La invitación ha caducado")
        if invite.max_uses and invite.uses_count >= invite.max_uses:
            raise HTTPException(status_code=400, detail="La invitación ha alcanzado su límite")

    user_obj = User(
        id=str(uuid.uuid4()),
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(user_obj)
    
    # If invited, join choir automatically
    if invite:
        membership = Membership(
            id=str(uuid.uuid4()),
            user_id=user_obj.id,
            choir_id=invite.choir_id,
            voice_part=VoicePart.SOPRANO # Default, user can change later
        )
        db.add(membership)
        invite.uses_count += 1
    
    db.commit()
    db.refresh(user_obj)
    return user_obj

@router.get("/me", response_model=UserSchema)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
