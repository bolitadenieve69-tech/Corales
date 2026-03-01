from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api import deps
from schemas.choir import ChoirCreate, ChoirSchema, ChoirUpdate
from models.user import User, UserRole
from models.choir import Choir, Membership, VoicePart
import uuid

router = APIRouter()

@router.get("/", response_model=List[ChoirSchema])
def read_choirs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve choirs for the current user.
    """
    if current_user.role == UserRole.ADMIN:
        return db.query(Choir).offset(skip).limit(limit).all()
    
    choirs = db.query(Choir).join(Membership).filter(Membership.user_id == current_user.id).all()
    return choirs

@router.post("/", response_model=ChoirSchema)
def create_choir(
    *,
    db: Session = Depends(deps.get_db),
    choir_in: ChoirCreate,
    current_user: User = Depends(deps.get_current_active_director)
) -> Any:
    """
    Create a new choir.
    """
    choir = Choir(
        id=str(uuid.uuid4()),
        name=choir_in.name,
        description=choir_in.description
    )
    db.add(choir)
    
    # Automatically add the creator as DIRECTOR
    membership = Membership(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        choir_id=choir.id,
        voice_part=VoicePart.DIRECTOR
    )
    db.add(membership)
    
    db.commit()
    db.refresh(choir)
    return choir

@router.get("/me", response_model=ChoirSchema)
def read_my_choir(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get the primary choir for the current user.
    """
    membership = db.query(Membership).filter(Membership.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="No choir found for this user")
    return membership.choir

@router.put("/me", response_model=ChoirSchema)
def update_my_choir(
    *,
    db: Session = Depends(deps.get_db),
    choir_in: ChoirUpdate,
    current_user: User = Depends(deps.get_current_active_director)
) -> Any:
    """
    Update the current user's choir.
    """
    membership = db.query(Membership).filter(Membership.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="No choir found to update")
    
    choir = membership.choir
    update_data = choir_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(choir, field, value)
    
    db.add(choir)
    db.commit()
    db.refresh(choir)
    return choir
