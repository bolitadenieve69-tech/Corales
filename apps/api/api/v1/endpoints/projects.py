from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api import deps
from schemas.project import ProjectCreate, ProjectSchema, ProjectUpdate
from schemas.project_repertoire import ProjectRepertoireCreate
from models.user import User, UserRole
from models.project import Project
from models.project_repertoire import ProjectRepertoire
import uuid

router = APIRouter()

@router.get("/", response_model=List[ProjectSchema])
def read_projects(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
    choir_id: str = None,
    season_id: str = None
) -> Any:
    query = db.query(Project)
    
    if choir_id:
        query = query.filter(Project.choir_id == choir_id)
        
    if season_id:
        query = query.filter(Project.season_id == season_id)
        
    # Los coralistas solo ven proyectos publicados
    if current_user.role != UserRole.DIRECTOR:
        query = query.filter(Project.is_published == True)
        
    projects = query.offset(skip).limit(limit).all()
    return projects

@router.post("/", response_model=ProjectSchema)
def create_project(
    *,
    db: Session = Depends(deps.get_db),
    project_in: ProjectCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    project = Project(
        id=str(uuid.uuid4()),
        name=project_in.name,
        description=project_in.description,
        date=project_in.date,
        is_published=project_in.is_published,
        choir_id=project_in.choir_id,
        season_id=project_in.season_id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.put("/{id}", response_model=ProjectSchema)
def update_project(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    project_in: ProjectUpdate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
        
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{id}")
def delete_project(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    db.delete(project)
    db.commit()
    return {"ok": True}

# --- Repertoire Endpoints ---
@router.post("/{id}/repertoire", response_model=ProjectSchema)
def add_repertoire_to_project(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    repertoire_in: ProjectRepertoireCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    rep = ProjectRepertoire(
        id=str(uuid.uuid4()),
        project_id=id,
        work_title=repertoire_in.work_title,
        order=repertoire_in.order
    )
    db.add(rep)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{id}/repertoire/{repertoire_id}", response_model=ProjectSchema)
def delete_repertoire_from_project(
    *,
    db: Session = Depends(deps.get_db),
    id: str,
    repertoire_id: str,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    if current_user.role != UserRole.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    project = db.query(Project).filter(Project.id == id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    rep = db.query(ProjectRepertoire).filter(ProjectRepertoire.id == repertoire_id, ProjectRepertoire.project_id == id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Repertoire not found")
        
    db.delete(rep)
    db.commit()
    db.refresh(project)
    return project
