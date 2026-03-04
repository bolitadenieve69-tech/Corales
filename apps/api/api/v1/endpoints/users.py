from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil
import uuid
from services.storage import storage_service
from api import deps
from core.database import get_db
from core.security import get_password_hash
from models.user import User
from schemas.user import User as UserSchema, UserCreate
from schemas.feedback import FeedbackRead

router = APIRouter()

@router.get("/me/feedback", response_model=List[FeedbackRead])
def get_my_feedback(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all personal feedback for the current user.
    """
    from models.feedback import DirectFeedback
    return db.query(DirectFeedback).filter(DirectFeedback.recipient_id == current_user.id).order_by(DirectFeedback.created_at.desc()).all()

@router.put("/me/feedback/{feedback_id}/read", response_model=FeedbackRead)
def mark_feedback_as_read(
    feedback_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark a feedback note as read.
    """
    from models.feedback import DirectFeedback
    from datetime import datetime
    
    feedback = db.query(DirectFeedback).filter(
        DirectFeedback.id == feedback_id,
        DirectFeedback.recipient_id == current_user.id
    ).first()
    
    if not feedback:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado")
        
    feedback.read_at = datetime.utcnow()
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

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
        from models.choir import Choir
        choir = db.query(Choir).filter(Choir.id == invite.choir_id).first()
        current_members = db.query(Membership).filter(Membership.choir_id == invite.choir_id).count()
        
        if current_members >= (choir.max_users or 50):
            raise HTTPException(
                status_code=400, 
                detail=f"El coro '{choir.name}' ha alcanzado su límite de {choir.max_users} miembros."
            )

        membership = Membership(
            id=str(uuid.uuid4()),
            user_id=user_obj.id,
            choir_id=invite.choir_id,
            voice_part=VoicePart.SOPRANO # Default, user can change later
        )
        db.add(membership)
        invite.uses_count += 1
    else:
        # Fallback for MVP: Assign all non-invited registering users to the demo choir
        from models.choir import Choir
        choir = db.query(Choir).filter(Choir.name == "Coro de Prueba").first()
        if choir:
            role = VoicePart.DIRECTOR if user_obj.role in ["DIRECTOR", "ADMIN"] else VoicePart.SOPRANO
            membership = Membership(
                id=str(uuid.uuid4()),
                user_id=user_obj.id,
                choir_id=choir.id,
                voice_part=role
            )
            db.add(membership)
    
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

@router.put("/me", response_model=UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    user_in: UserSchema, # Using full schema for simplicity in mapping
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user profile titles/bio.
    """
    if user_in.full_name:
        current_user.full_name = user_in.full_name
    if user_in.avatar_url:
        current_user.avatar_url = user_in.avatar_url
    if user_in.bio:
        current_user.bio = user_in.bio
    if user_in.favorite_voice:
        current_user.favorite_voice = user_in.favorite_voice
        
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/avatar", response_model=UserSchema)
def upload_avatar(
    *,
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload and update user avatar.
    """
    # Create temp directory
    temp_dir = "data/temp/avatars"
    os.makedirs(temp_dir, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}{file_extension}"
    temp_path = os.path.join(temp_dir, unique_filename)
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Upload to storage
        remote_path = f"avatars/{unique_filename}"
        storage_path = storage_service.upload_file(temp_path, remote_path)
        
        # Update user avatar_url
        current_user.avatar_url = storage_path
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        
        return current_user
    finally:
        # Cleanup
        if os.path.exists(temp_path) and storage_service.mode != "local":
            os.remove(temp_path)
