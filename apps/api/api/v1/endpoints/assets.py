from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os

from core.database import get_db
from models import Asset, Edition, Work
from schemas.asset import AssetCreate, AssetUpdate, AssetSchema
from api.deps import get_current_user
from models import User
from services.storage import storage_service
from fastapi.responses import RedirectResponse, FileResponse
import shutil
import uuid
from fastapi import UploadFile, File, Form

router = APIRouter(tags=["assets"])

    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if storage_service.mode == "s3":
        url = storage_service.get_file_url(asset.file_url)
        return RedirectResponse(url=url)
    else:
        file_path = asset.file_url
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File physical path not found")
        return FileResponse(path=file_path, filename=asset.original_filename)

@router.post("/", response_model=AssetSchema)
def create_asset(
    asset: AssetCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify edition exists
    edition = db.query(Edition).filter(Edition.id == asset.edition_id).first()
    if not edition:
        raise HTTPException(status_code=404, detail="Edition not found")
        
    db_asset = Asset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/edition/{edition_id}", response_model=List[AssetSchema])
def get_assets_by_edition(
    edition_id: str, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assets = db.query(Asset).filter(Asset.edition_id == edition_id).offset(skip).limit(limit).all()
    return assets

@router.post("/upload", response_model=AssetSchema)
def upload_asset(
    file: UploadFile = File(...),
    edition_id: str = Form(...),
    asset_type: str = Form(...),
    rights_confirmed: bool = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not rights_confirmed:
        raise HTTPException(status_code=400, detail="Debe confirmar que tiene los derechos para subir este archivo.")
        
    edition = db.query(Edition).filter(Edition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=404, detail="Edition not found")
        
    # Check choir access: Edition -> Work -> Choir
    work = db.query(Work).filter(Work.id == edition.work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work for this edition not found")
        
    # En un entorno real se comprobaría si el usuario es miembro/director de work.choir_id
    
    # Temporary save to local disk
    temp_dir = "data/temp"
    os.makedirs(temp_dir, exist_ok=True)
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    temp_path = os.path.join(temp_dir, unique_filename)
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Upload to storage service
        remote_path = f"editions/{edition_id}/{unique_filename}"
        storage_path = storage_service.upload_file(temp_path, remote_path)
            
        db_asset = Asset(
            edition_id=edition_id,
            asset_type=asset_type,
            file_url=storage_path,
            original_filename=file.filename
        )
        db.add(db_asset)
        db.commit()
        db.refresh(db_asset)
        return db_asset
    finally:
        # Cleanup temp file if it's not the same as storage_path (which happens in local mode)
        if os.path.exists(temp_path) and temp_path != storage_path:
            os.remove(temp_path)

@router.post("/upload-musicxml", response_model=AssetSchema)
def upload_musicxml(
    file: UploadFile = File(...),
    edition_id: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a MusicXML file and trigger automatic processing.
    
    The file is saved and a background job is enqueued that will:
    1. Parse the MusicXML with music21
    2. Detect parts and attempt SATB auto-mapping
    3. If successful, generate MIDIs and audio (future)
    
    Returns the asset with processing_status='PENDING'.
    Poll GET /pipeline/status/{asset_id} to check progress.
    """
    # Validate file extension
    if file.filename:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in (".musicxml", ".xml", ".mxl"):
            raise HTTPException(
                status_code=400,
                detail=f"Formato no soportado: '{ext}'. Use .musicxml, .xml o .mxl"
            )

    # Verify edition exists
    edition = db.query(Edition).filter(Edition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=404, detail="Edition not found")

    # Temporary save
    temp_dir = "data/temp"
    os.makedirs(temp_dir, exist_ok=True)
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".musicxml"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    temp_path = os.path.join(temp_dir, unique_filename)

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Upload to storage
        remote_path = f"editions/{edition_id}/{unique_filename}"
        storage_path = storage_service.upload_file(temp_path, remote_path)

        # Create asset with PENDING status
        db_asset = Asset(
            edition_id=edition_id,
            asset_type="MUSICXML",
            file_url=storage_path,
            original_filename=file.filename,
            processing_status="PENDING",
        )
        db.add(db_asset)
        db.commit()
        db.refresh(db_asset)

        # Enqueue processing job
        try:
            from services.pipeline.enqueue import enqueue_process_musicxml
            job_id = enqueue_process_musicxml(db_asset.id)
            
            import json
            meta = {"rq_job_id": job_id}
            db_asset.metadata_json = json.dumps(meta)
            db.commit()
        except Exception as e:
            db_asset.processing_status = "ERROR"
            db_asset.processing_error = f"Could not enqueue job: {str(e)}"
            db.commit()

        return db_asset
    finally:
        # Cleanup temp file
        if os.path.exists(temp_path) and temp_path != storage_path:
            os.remove(temp_path)

@router.get("/{asset_id}", response_model=AssetSchema)
def get_asset(
    asset_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.put("/{asset_id}", response_model=AssetSchema)
def update_asset(
    asset_id: str, 
    asset_update: AssetUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    update_data = asset_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_asset, key, value)
        
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(
    asset_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
        
    db.delete(db_asset)
    db.commit()
    return None
