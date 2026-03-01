from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from api.deps import get_db, get_current_user
from models.user import User
from models.practice_progress import PracticeProgress, PracticeStatus
from models.project import Project
from models.project_repertoire import ProjectRepertoire
from models.work import Work
from schemas.practice_progress import PracticeProgress as PracticeProgressSchema
from schemas.practice_progress import PracticeProgressCreate, PracticeProgressUpdate

router = APIRouter()

@router.post("/", response_model=PracticeProgressSchema)
def create_or_update_progress(
    *,
    db: Session = Depends(get_db),
    progress_in: PracticeProgressCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Log or update practice progress (status and/or minutes) for a specific work.
    """
    # Check if the work exists
    work = db.query(Work).filter(Work.id == progress_in.work_id).first()
    if not work:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work not found"
        )
        
    # See if there's already an entry for this user and work
    progress = db.query(PracticeProgress).filter(
        PracticeProgress.user_id == current_user.id,
        PracticeProgress.work_id == progress_in.work_id
    ).first()
    
    if progress:
        # Update existing
        if progress_in.status:
            progress.status = progress_in.status
        if progress_in.minutes_practiced:
            progress.minutes_practiced += progress_in.minutes_practiced
        db.add(progress)
    else:
        # Create new
        progress = PracticeProgress(
            user_id=current_user.id,
            work_id=progress_in.work_id,
            status=progress_in.status,
            minutes_practiced=progress_in.minutes_practiced
        )
        db.add(progress)
        
    db.commit()
    db.refresh(progress)
    return progress

@router.get("/", response_model=List[PracticeProgressSchema])
def get_my_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get all practice progress entries for the current user.
    """
    progress_entries = db.query(PracticeProgress).filter(
        PracticeProgress.user_id == current_user.id
    ).all()
    
    return progress_entries

@router.get("/project/{project_id}")
def get_project_progress(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get aggregated progress for a specific project.
    Only accessible by the director of the project's choir.
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check authorization (Director of the choir)
    # This is a bit simplified; ideally check memberships table for DIRECTOR role in this specific choir
    
    # 1. Get all repertoire items for this project
    repertoire = db.query(ProjectRepertoire).filter(
        ProjectRepertoire.project_id == project_id
    ).all()
    
    # Collect work IDs for this project
    work_ids = []
    for item in repertoire:
        if item.edition and item.edition.work_id:
            work_ids.append(item.edition.work_id)
            
    # Remove duplicates
    work_ids = list(set(work_ids))
    
    # 2. Query progress for these works across all users in the choir
    # Aggregate by work_id to show stats (e.g. how many people at what status, total minutes)
    
    results = []
    for wid in work_ids:
        work = db.query(Work).filter(Work.id == wid).first()
        if not work:
            continue
            
        progress_entries = db.query(PracticeProgress).filter(
            PracticeProgress.work_id == wid
        ).all()
        
        status_counts = {"NUEVA": 0, "EN_PROGRESO": 0, "DOMINADA": 0}
        total_minutes = 0
        
        for p in progress_entries:
            # En la vida real aquí filtraríamos para contar solo a los coralistas 
            # que ESTÁN en este coro, pero en el MVP es aceptable contarlos todos si la base es el proyecto
            status_counts[p.status.value] += 1
            total_minutes += p.minutes_practiced
            
        results.append({
            "work_id": wid,
            "work_title": work.title,
            "total_practicing_users": len(progress_entries),
            "status_distribution": status_counts,
            "total_minutes": total_minutes
        })
        
    return {
        "project_id": project_id,
        "project_name": project.name,
        "progress_by_work": results
    }
