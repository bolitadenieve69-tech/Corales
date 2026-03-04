from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models import Work, Choir
from schemas.work import WorkCreate, WorkUpdate, WorkSchema
from api import deps
from models import User

router = APIRouter(tags=["works"])

@router.post("/", response_model=WorkSchema)
def create_work(
    work: WorkCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_director)
):
    # Verify choir exists and user has access
    choir = db.query(Choir).filter(Choir.id == work.choir_id).first()
    if not choir:
        raise HTTPException(status_code=404, detail="Choir not found")
    
    if not deps.check_choir_access(work.choir_id, current_user.id, db, required_role="DIRECTOR") and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos de dirección en este coro")
        
    db_work = Work(**work.model_dump())
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return db_work

@router.get("/", response_model=List[WorkSchema])
def get_works(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    from models.choir import Membership
    
    # Check if the user is an admin
    if current_user.role == "ADMIN":
        # Admin can see all works in the MVP
        works = db.query(Work).offset(skip).limit(limit).all()
        return works
        
    # Find choirs the user is a member of
    memberships = db.query(Membership).filter(Membership.user_id == current_user.id).all()
    choir_ids = [m.choir_id for m in memberships]
    
    works = db.query(Work).filter(Work.choir_id.in_(choir_ids)).offset(skip).limit(limit).all()
    return works

@router.get("/choir/{choir_id}", response_model=List[WorkSchema])
def get_works_by_choir(
    choir_id: str, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    works = db.query(Work).filter(Work.choir_id == choir_id).offset(skip).limit(limit).all()
    return works

@router.get("/{work_id}", response_model=WorkSchema)
def get_work(
    work_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
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
    current_user: User = Depends(deps.get_current_active_director)
):
    db_work = db.query(Work).filter(Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    if not deps.check_choir_access(db_work.choir_id, current_user.id, db, required_role="DIRECTOR") and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos de dirección sobre esta obra")
        
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
    current_user: User = Depends(deps.get_current_active_director)
):
    db_work = db.query(Work).filter(Work.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=404, detail="Work not found")
    
    if not deps.check_choir_access(db_work.choir_id, current_user.id, db, required_role="DIRECTOR") and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos de dirección sobre esta obra")
        
    db.delete(db_work)
    db.commit()
    return None
