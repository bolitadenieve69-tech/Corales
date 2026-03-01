from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import secrets
from datetime import datetime

from core.database import get_db
from models.invite import Invite
from models.choir import Choir, Membership
from schemas.invite import InviteCreate, InviteSchema, InviteValidateResponse
from api.deps import get_current_user
from models.user import User

router = APIRouter(tags=["invites"])

@router.post("/", response_model=InviteSchema)
def create_invite(
    invite_in: InviteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is director of this choir
    membership = db.query(Membership).filter(
        Membership.user_id == current_user.id,
        Membership.choir_id == invite_in.choir_id,
        Membership.voice_part == "DIRECTOR"
    ).first()
    
    if not membership and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Check quota
    choir = db.query(Choir).filter(Choir.id == invite_in.choir_id).first()
    current_members = db.query(Membership).filter(Membership.choir_id == invite_in.choir_id).count()
    
    if current_members >= (choir.max_users or 50):
        raise HTTPException(
            status_code=400, 
            detail=f"Has alcanzado el límite de {choir.max_users} miembros para este coro."
        )

    # Generate unique code
    code = secrets.token_urlsafe(8)
    
    db_invite = Invite(
        id=str(uuid.uuid4()),
        code=code,
        choir_id=invite_in.choir_id,
        created_by_id=current_user.id,
        max_uses=invite_in.max_uses,
        expires_at=invite_in.expires_at
    )
    
    db.add(db_invite)
    db.commit()
    db.refresh(db_invite)
    return db_invite

@router.get("/me", response_model=List[InviteSchema])
def get_my_choir_invites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get choir where user is director
    membership = db.query(Membership).filter(
        Membership.user_id == current_user.id,
        Membership.voice_part == "DIRECTOR"
    ).first()
    
    if not membership:
        return []
        
    return db.query(Invite).filter(Invite.choir_id == membership.choir_id).all()

@router.get("/validate/{code}", response_model=InviteValidateResponse)
def validate_invite(code: str, db: Session = Depends(get_db)):
    invite = db.query(Invite).filter(Invite.code == code).first()
    
    if not invite:
        return {"valid": False, "message": "Código de invitación no válido"}
        
    if invite.expires_at and invite.expires_at < datetime.utcnow():
        return {"valid": False, "message": "La invitación ha caducado"}
        
    if invite.max_uses and invite.uses_count >= invite.max_uses:
        return {"valid": False, "message": "La invitación ha alcanzado su límite de usos"}
        
    return {
        "valid": True, 
        "choir_name": invite.choir.name,
        "message": "Código válido"
    }

@router.delete("/{invite_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_invite(
    invite_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invite = db.query(Invite).filter(Invite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
        
    # Only creator or admin can delete
    if invite.created_by_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    db.delete(invite)
    db.commit()
    return None
