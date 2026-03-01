from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models import Edition, Work
from schemas.edition import EditionCreate, EditionUpdate, EditionSchema
from api.deps import get_current_user
from models import User

router = APIRouter(tags=["editions"])

@router.post("/", response_model=EditionSchema)
def create_edition(
    edition: EditionCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify work exists
    work = db.query(Work).filter(Work.id == edition.work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
        
    db_edition = Edition(**edition.model_dump())
    db.add(db_edition)
    db.commit()
    db.refresh(db_edition)
    return db_edition

@router.get("/work/{work_id}", response_model=List[EditionSchema])
def get_editions_by_work(
    work_id: str, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    editions = db.query(Edition).filter(Edition.work_id == work_id).offset(skip).limit(limit).all()
    return editions

@router.get("/{edition_id}", response_model=EditionSchema)
def get_edition(
    edition_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    edition = db.query(Edition).filter(Edition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=404, detail="Edition not found")
    return edition

@router.put("/{edition_id}", response_model=EditionSchema)
def update_edition(
    edition_id: str, 
    edition_update: EditionUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_edition = db.query(Edition).filter(Edition.id == edition_id).first()
    if not db_edition:
        raise HTTPException(status_code=404, detail="Edition not found")
        
    update_data = edition_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_edition, key, value)
        
    db.commit()
    db.refresh(db_edition)
    return db_edition

@router.delete("/{edition_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_edition(
    edition_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_edition = db.query(Edition).filter(Edition.id == edition_id).first()
    if not db_edition:
        raise HTTPException(status_code=404, detail="Edition not found")
        
    db.delete(db_edition)
    db.commit()
    return None
