from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api import deps
from schemas.choir import ChoirCreate, ChoirSchema, ChoirUpdate, ChoirAssignment
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

@router.post("/admin/assign", response_model=ChoirSchema)
def assign_choir_admin(
    *,
    db: Session = Depends(deps.get_db),
    assignment: ChoirAssignment,
    current_user: User = Depends(deps.get_current_active_admin)
) -> Any:
    """
    (ADMIN ONLY) Create a choir and assign a user as DIRECTOR or SUBDIRECTOR.
    """
    # Create the choir
    choir = Choir(
        id=str(uuid.uuid4()),
        name=assignment.name,
        description=assignment.description,
        max_users=assignment.max_users
    )
    db.add(choir)
    
    # Map the role string to VoicePart
    role = VoicePart.DIRECTOR
    if assignment.role.upper() == "SUBDIRECTOR":
        role = VoicePart.SUBDIRECTOR
        
    # Assign the target user
    membership = Membership(
        id=str(uuid.uuid4()),
        user_id=assignment.user_id,
        choir_id=choir.id,
        voice_part=role
    )
    db.add(membership)
    
    db.commit()
    db.refresh(choir)
    return choir

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
    create_data = choir_in.model_dump()
    create_data["id"] = str(uuid.uuid4())
    choir = Choir(**create_data)
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
    
    # Only ADMIN can update max_users
    if "max_users" in update_data and current_user.role != UserRole.ADMIN:
        update_data.pop("max_users")
        
    for field, value in update_data.items():
        setattr(choir, field, value)
    
    # 🔥 Sincronizar el nombre del director con el perfil de usuario del director
    if "director_name" in update_data and update_data["director_name"]:
        current_user.full_name = update_data["director_name"]
        db.add(current_user)
    
    db.add(choir)
    db.commit()
    db.refresh(choir)
    return choir

from fastapi import UploadFile, File, Form
import os
import shutil
from services.storage import storage_service

@router.post("/me/upload-asset", response_model=ChoirSchema)
def upload_choir_asset(
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    asset_type: str = Form("logo"), # "logo" or "cover"
    current_user: User = Depends(deps.get_current_active_director)
) -> Any:
    """
    Upload a logo or cover photo for the choir.
    """
    membership = db.query(Membership).filter(Membership.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="No choir found")
    
    choir = membership.choir
    
    # Temporary save to local disk
    temp_dir = "data/temp"
    os.makedirs(temp_dir, exist_ok=True)
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"choir_{choir.id}_{asset_type}{file_extension}"
    temp_path = os.path.join(temp_dir, unique_filename)
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        remote_path = f"choirs/{choir.id}/{unique_filename}"
        storage_path = storage_service.upload_file(temp_path, remote_path)
        
        # Determine whether to set logo_url or cover_photo_url
        if asset_type == "cover":
            choir.cover_photo_url = storage_path
        else:
            choir.logo_url = storage_path
            
        db.add(choir)
        db.commit()
        db.refresh(choir)
        return choir
    finally:
        if os.path.exists(temp_path) and temp_path != storage_path:
            os.remove(temp_path)

from fastapi.responses import RedirectResponse, FileResponse

@router.get("/{choir_id}/asset/{asset_type}")
def get_choir_asset(
    choir_id: str,
    asset_type: str, # "logo" or "cover"
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get a choir asset (logo or cover) by choir ID.
    """
    choir = db.query(Choir).filter(Choir.id == choir_id).first()
    if not choir:
        raise HTTPException(status_code=404, detail="Choir not found")
        
    file_path = choir.cover_photo_url if asset_type == "cover" else choir.logo_url
    
    if not file_path:
        raise HTTPException(status_code=404, detail=f"No {asset_type} found for this choir")
        
    if storage_service.mode == "s3":
        url = storage_service.get_file_url(file_path)
        return RedirectResponse(url=url)
    else:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File physical path not found")
        return FileResponse(path=file_path)

@router.get("/me/asset/{asset_type}")
def get_my_choir_asset(
    asset_type: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get the current user's choir asset.
    """
    membership = db.query(Membership).filter(Membership.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="No choir found")
    return get_choir_asset(choir_id=membership.choir_id, asset_type=asset_type, db=db)
