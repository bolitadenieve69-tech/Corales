from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models import Work, Choir
from schemas.work import WorkCreate, WorkUpdate, WorkSchema
from api.deps import get_current_user
from models import User

router = APIRouter(prefix="/works", tags=["works"])

@router.post("/", response_model=WorkSchema)
def create_work(
    work: WorkCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify choir exists and user has access
    choir = db.query(Choir).filter(Choir.id == work.choir_id).first()
    if not choir:
        raise HTTPException(status_code=404, detail="Choir not found")
        
    db_work = Work(**work.model_dump())
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return db_work

@router.get("/choir/{choir_id}", response_model=List[WorkSchema])
def get_works_by_choir(
    choir_id: str, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    works = db.query(Work).filter(Work.choir_id == choir_id).offset(skip).limit(limit).all()
    return works

@router.get("/{work_id}", response_model=WorkSchema)
def get_work(
    work_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    work = db.query(Work).filter(Work.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    return work

@router.put("/{work_id}", response_model=WorkSchema)
def update_work(
    work_id: str, 
    work_update: WorkUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_work = db.query(Work).filter(Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=404, detail="Work not found")
        
    update_data = work_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_work, key, value)
        
    db.commit()
    db.refresh(db_work)
    return db_work

@router.delete("/{work_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work(
    work_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_work = db.query(Work).filter(Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=404, detail="Work not found")
        
    db.delete(db_work)
    db.commit()
    return None
