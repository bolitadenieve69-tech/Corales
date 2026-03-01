from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api import deps
from schemas.season import SeasonCreate, SeasonSchema, SeasonUpdate
from models.user import User, UserRole
from models.season import Season
import uuid

router = APIRouter()

@router.get("/", response_model=List[SeasonSchema])
def read_seasons(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
    choir_id: str = None
) -> Any:
    # Si el usuario es miembro de varios coros, requerimos el choir_id
    if current_user.role == UserRole.DIRECTOR and choir_id is None:
        raise HTTPException(status_code=400, detail="Manda el choir_id para saber de qué coro quieres las temporadas.")
    
    query = db.query(Season)
    if choir_id:
        query = query.filter(Season.choir_id == choir_id)
        
    seasons = query.offset(skip).limit(limit).all()
    return seasons

@router.post("/", response_model=SeasonSchema)
def create_season(
    *,
    db: Session = Depends(deps.get_db),
    season_in: SeasonCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    season = Season(
        id=str(uuid.uuid4()),
        name=season_in.name,
        start_date=season_in.start_date,
        end_date=season_in.end_date,
        choir_id=season_in.choir_id
    )
    db.add(season)
    db.commit()
    db.refresh(season)
    return season

@router.put("/{id}", response_model=SeasonSchema)
def update_season(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    season_in: SeasonUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    season = db.query(Season).filter(Season.id == id).first()
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
        
    update_data = season_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(season, field, value)
        
    db.add(season)
    db.commit()
    db.refresh(season)
    return season

@router.delete("/{id}")
def delete_season(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    season = db.query(Season).filter(Season.id == id).first()
    if not season:
        raise HTTPException(status_code=404, detail="Season not found")
        
    db.delete(season)
    db.commit()
    return {"ok": True}
