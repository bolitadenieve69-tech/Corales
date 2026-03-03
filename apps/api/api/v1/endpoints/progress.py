from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from api import deps
from api.deps import get_db
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
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Log or update practice progress (status and/or minutes) for a specific work.
    """
    work = db.query(Work).filter(Work.id == progress_in.work_id).first()
    if not work:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Work not found")
        
    progress = db.query(PracticeProgress).filter(
        PracticeProgress.user_id == current_user.id,
        PracticeProgress.work_id == progress_in.work_id
    ).first()
    
    if progress:
        if progress_in.status:
            progress.status = progress_in.status
        if progress_in.minutes_practiced:
            progress.minutes_practiced += progress_in.minutes_practiced
        db.add(progress)
    else:
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
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get all practice progress entries for the current user.
    """
    return db.query(PracticeProgress).filter(PracticeProgress.user_id == current_user.id).all()

@router.get("/stats/me")
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get personal practice statistics for the current user.
    """
    total_minutes = db.query(func.sum(PracticeProgress.minutes_practiced)).filter(
        PracticeProgress.user_id == current_user.id
    ).scalar() or 0
    
    works_studied = db.query(func.count(PracticeProgress.id)).filter(
        PracticeProgress.user_id == current_user.id
    ).scalar() or 0
    
    most_practiced = db.query(
        Work.title, 
        PracticeProgress.minutes_practiced
    ).join(Work).filter(
        PracticeProgress.user_id == current_user.id
    ).order_by(PracticeProgress.minutes_practiced.desc()).first()
    
    return {
        "total_minutes": total_minutes,
        "works_studied": works_studied,
        "most_practiced_work": most_practiced[0] if most_practiced else None,
        "most_practiced_minutes": most_practiced[1] if most_practiced else 0
    }

@router.get("/project/{project_id}")
def get_project_progress(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get aggregated progress for a specific project with status counts.
    """
    from models.membership import Membership
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    repertoire = db.query(ProjectRepertoire).filter(ProjectRepertoire.project_id == project_id).all()
    # Get all members of the choir to calculate "NUEVA" status (those with no entry)
    members = db.query(Membership).filter(Membership.choir_id == project.choir_id).all()
    total_members_count = len(members)
    member_ids = [m.user_id for m in members]
    
    results = []
    for item in repertoire:
        work_id = item.work_id
        if not work_id:
            continue
            
        progress_entries = db.query(PracticeProgress).filter(
            PracticeProgress.work_id == work_id,
            PracticeProgress.user_id.in_(member_ids)
        ).all()
        
        # Initialize counts
        status_counts = {
            "NUEVA": 0,
            "EN_PROGRESO": 0,
            "DOMINADA": 0
        }
        
        # Count entries
        users_with_progress = set()
        for p in progress_entries:
            status_counts[p.status] += 1
            users_with_progress.add(p.user_id)
            
        # Users in the choir but without a progress entry for this work are "NUEVA"
        status_counts["NUEVA"] += (total_members_count - len(users_with_progress))
        
        results.append({
            "work_id": str(work_id),
            "work_title": item.work_title,
            "total_users": total_members_count,
            "nueva": status_counts["NUEVA"],
            "en_progreso": status_counts["EN_PROGRESO"],
            "dominada": status_counts["DOMINADA"]
        })
        
    return results
