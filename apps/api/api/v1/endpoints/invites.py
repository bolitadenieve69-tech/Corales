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

    # Check quota availability (Strict Distribution)
    # We sum: Current members + Pending slots in all active non-expired invites
    choir = db.query(Choir).filter(Choir.id == invite_in.choir_id).first()
    current_members = db.query(Membership).filter(Membership.choir_id == invite_in.choir_id).count()
    
    # Get all active invites for this choir
    from sqlalchemy import or_
    active_invites = db.query(Invite).filter(
        Invite.choir_id == invite_in.choir_id,
        or_(Invite.expires_at == None, Invite.expires_at > datetime.utcnow()),
        or_(Invite.max_uses == None, Invite.uses_count < Invite.max_uses)
    ).all()
    
    # Calculate pending reserved slots
    # Note: If an invite is "unlimited" (max_uses=None), it technically consumes all remaining slots.
    # We treat None as a large number or handle it as "full" for directors.
    reserved_slots = 0
    for inv in active_invites:
        if inv.max_uses is None:
            # Unlimited invite exists; no more slots can be reserved by others
            reserved_slots = choir.max_users
            break
        reserved_slots += (inv.max_uses - inv.uses_count)
    
    requested_slots = invite_in.max_uses if invite_in.max_uses is not None else (choir.max_users - current_members - reserved_slots)
    
    if (current_members + reserved_slots + (invite_in.max_uses or 0)) > (choir.max_users or 50):
        # Allow Admin to bypass if needed, but for now enforce for everyone to keep it consistent with "pactado"
        available = max(0, choir.max_users - current_members - reserved_slots)
        raise HTTPException(
            status_code=400, 
            detail=f"No hay suficiente cuota disponible. Espacio restante: {available}. "
                   f"Ya hay {current_members} miembros y {reserved_slots} espacios reservados en otras invitaciones."
        )

    # Generate unique code (32 bytes as per rules)
    code = secrets.token_urlsafe(32)
    
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
