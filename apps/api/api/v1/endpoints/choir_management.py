from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api import deps
from core.database import get_db
from models.choir import Choir, Membership, VoicePart
from models.user import User
from models.season import Season
from models.feedback import DirectFeedback
from schemas.choir import Season as SeasonSchema, SeasonCreate, SeasonUpdate, ChoirMemberDetail
from schemas.feedback import FeedbackCreate, FeedbackRead

router = APIRouter()

@router.post("/{choir_id}/feedback", response_model=FeedbackRead)
def send_feedback(
    choir_id: str,
    *,
    db: Session = Depends(get_db),
    feedback_in: FeedbackCreate,
    current_user: User = Depends(deps.get_current_active_director),
) -> Any:
    """
    Send personal feedback to a choir member. Only for Directors of this choir.
    """
    if not deps.check_choir_access(choir_id, current_user.id, db, required_role="DIRECTOR") and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos de dirección en este coro")

    # Verify recipient is in the choir
    recipient_membership = db.query(Membership).filter(
        Membership.choir_id == choir_id,
        Membership.user_id == feedback_in.recipient_id
    ).first()
    
    if not recipient_membership:
        raise HTTPException(status_code=404, detail="El destinatario no es miembro de este coro")

    import uuid
    feedback = DirectFeedback(
        id=str(uuid.uuid4()),
        sender_id=current_user.id,
        recipient_id=feedback_in.recipient_id,
        choir_id=choir_id,
        work_id=feedback_in.work_id,
        content=feedback_in.content
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

@router.get("/{choir_id}/members", response_model=List[ChoirMemberDetail])
def get_choir_members(
    choir_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all members of a choir with profile details.
    Only for members of that choir.
    """
    # Check if user is part of the choir
    membership = db.query(Membership).filter(
        Membership.choir_id == choir_id,
        Membership.user_id == current_user.id
    ).first()
    
    if not membership and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes acceso a este coro")

    members = db.query(Membership).join(User).filter(Membership.choir_id == choir_id).all()
    
    result = []
    for m in members:
        result.append({
            "id": m.id,
            "user_id": m.user.id,
            "full_name": m.user.full_name,
            "email": m.user.email,
            "role": m.user.role,
            "voice_part": m.voice_part,
            "avatar_url": m.user.avatar_url,
            "dni": m.user.dni,
            "phone": m.user.phone,
            "has_whatsapp": m.user.has_whatsapp,
            "address": m.user.address
        })
    return result

from pydantic import EmailStr
from schemas.choir import ChoirMemberCreate
from core.security import get_password_hash

@router.post("/{choir_id}/members/add", response_model=ChoirMemberDetail)
def add_choir_member(
    choir_id: str,
    *,
    db: Session = Depends(get_db),
    member_in: ChoirMemberCreate,
    current_user: User = Depends(deps.get_current_active_director),
) -> Any:
    """
    Directly add a new member to the choir. Only for Directors of this choir.
    """
    if not deps.check_choir_access(choir_id, current_user.id, db, required_role="DIRECTOR") and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos de dirección en este coro")

    choir = db.query(Choir).filter(Choir.id == choir_id).first()
    if not choir:
        raise HTTPException(status_code=404, detail="Choir not found")

    # Check quotas
    current_members_count = db.query(Membership).filter(Membership.choir_id == choir_id).count()
    if current_members_count >= choir.max_users:
        raise HTTPException(status_code=400, detail=f"El coro '{choir.name}' ha alcanzado su límite de {choir.max_users} miembros.")

    # Check if user exists
    user = db.query(User).filter(User.email == member_in.email).first()
    
    import uuid
    if not user:
        # Create a new user with default random password since director is adding them
        # In a real app we'd trigger a welcome email with a password reset link
        default_pwd = str(uuid.uuid4())[:12]
        user = User(
            id=str(uuid.uuid4()),
            email=member_in.email,
            hashed_password=get_password_hash(default_pwd),
            full_name=member_in.full_name,
            dni=member_in.dni,
            phone=member_in.phone,
            has_whatsapp=member_in.has_whatsapp,
            address=member_in.address,
            role="CORALISTA"
        )
        db.add(user)
    else:
        # Update user details if they already exist but ensure we don't overwrite with nulls unnecessarily
        if member_in.full_name: user.full_name = member_in.full_name
        if member_in.dni: user.dni = member_in.dni
        if member_in.phone: user.phone = member_in.phone
        if member_in.address: user.address = member_in.address
        user.has_whatsapp = member_in.has_whatsapp

    # Check if membership already exists
    membership = db.query(Membership).filter(
        Membership.choir_id == choir_id,
        Membership.user_id == user.id
    ).first()

    if membership:
        raise HTTPException(status_code=400, detail="El usuario ya es miembro del coro")

    membership = Membership(
        id=str(uuid.uuid4()),
        user_id=user.id,
        choir_id=choir_id,
        voice_part=member_in.voice_part
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)

    return {
        "id": membership.id,
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "voice_part": membership.voice_part,
        "avatar_url": user.avatar_url,
        "dni": user.dni,
        "phone": user.phone,
        "has_whatsapp": user.has_whatsapp,
        "address": user.address
    }

@router.post("/{choir_id}/seasons", response_model=SeasonSchema)
def create_season(
    choir_id: str,
    *,
    db: Session = Depends(get_db),
    season_in: SeasonCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new season for a choir. Only for Directors/Admins of this choir.
    """
    if not deps.check_choir_access(choir_id, current_user.id, db, required_role="DIRECTOR") and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos de dirección en este coro")

    import uuid
    season = Season(
        id=str(uuid.uuid4()),
        name=season_in.name,
        start_date=season_in.start_date,
        end_date=season_in.end_date,
        choir_id=choir_id
    )
    db.add(season)
    db.commit()
    db.refresh(season)
    return season

@router.get("/{choir_id}/seasons", response_model=List[SeasonSchema])
def list_seasons(
    choir_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    List all seasons for a choir.
    """
    return db.query(Season).filter(Season.choir_id == choir_id).all()

@router.get("/my-repertoire", response_model=List[Any])
def get_my_repertoire(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get everything the current user needs to study:
    Seasons of their choir, projects in those seasons, and repertoire in those projects.
    """
    # 1. Get user's choir(s)
    memberships = db.query(Membership).filter(Membership.user_id == current_user.id).all()
    if not memberships:
        return []

    choir_ids = [m.choir_id for m in memberships]
    
    # 2. Get seasons for these choirs
    seasons = db.query(Season).filter(Season.choir_id.in_(choir_ids)).all()
    
    from models.project import Project
    from models.project_repertoire import ProjectRepertoire

    result = []
    for season in seasons:
        season_data = {
            "id": season.id,
            "name": season.name,
            "start_date": season.start_date,
            "end_date": season.end_date,
            "projects": []
        }
        
        # Get projects for this season
        projects = db.query(Project).filter(Project.season_id == season.id, Project.is_published == True).all()
        for project in projects:
            project_data = {
                "id": project.id,
                "name": project.name,
                "repertoire": []
            }
            
            # Get repertoire for this project
            from sqlalchemy.orm import joinedload
            repertoire = db.query(ProjectRepertoire).options(
                joinedload(ProjectRepertoire.edition),
                joinedload(ProjectRepertoire.work)
            ).filter(ProjectRepertoire.project_id == project.id).all()
            
            for item in repertoire:
                rep_data = {
                    "id": item.id,
                    "work_id": item.work_id,
                    "work_title": item.work.title if getattr(item, 'work', None) else item.work_title,
                    "order": item.order,
                    "assets": []
                }

                # Include assets if an edition is linked
                if getattr(item, 'edition', None) and getattr(item.edition, 'assets', None):
                    for asset in item.edition.assets:
                        rep_data["assets"].append({
                            "id": asset.id,
                            "type": asset.asset_type,
                            "url": asset.file_url,
                            "filename": asset.original_filename
                        })
                        
                project_data["repertoire"].append(rep_data)
            
            season_data["projects"].append(project_data)
        
        result.append(season_data)
        
    return result

@router.put("/{choir_id}/members/{membership_id}/voice", response_model=ChoirMemberDetail)
def update_member_voice(
    choir_id: str,
    membership_id: str,
    voice_part: VoicePart,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_director),
) -> Any:
    """
    Update a member's voice part. Only for Directors of this choir.
    """
    if not deps.check_choir_access(choir_id, current_user.id, db, required_role="DIRECTOR") and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos de dirección en este coro")
    membership = db.query(Membership).filter(
        Membership.id == membership_id,
        Membership.choir_id == choir_id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
        
    membership.voice_part = voice_part
    db.add(membership)
    db.commit()
    db.refresh(membership)
    
    return {
        "id": membership.id,
        "user_id": membership.user.id,
        "full_name": membership.user.full_name,
        "email": membership.user.email,
        "role": membership.user.role,
        "voice_part": membership.voice_part,
        "avatar_url": membership.user.avatar_url
    }

@router.delete("/{choir_id}/members/{membership_id}")
def remove_member(
    choir_id: str,
    membership_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_director),
) -> Any:
    """
    Remove a member from the choir. Only for Directors of this choir.
    """
    if not deps.check_choir_access(choir_id, current_user.id, db, required_role="DIRECTOR") and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos de dirección en este coro")
        
    membership = db.query(Membership).filter(
        Membership.id == membership_id,
        Membership.choir_id == choir_id
    ).first()
    
    if not membership:
        raise HTTPException(status_code=404, detail="Membership not found")
        
    if membership.user_id == current_user.id:
        raise HTTPException(status_code=400, detail="No puedes eliminarte a ti mismo")
        
    db.delete(membership)
    db.commit()
    
    return {"message": "Miembro eliminado con éxito"}

@router.get("/{choir_id}/stats", response_model=Any)
def get_choir_stats(
    choir_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_director),
) -> Any:
    """
    Get choir statistics (member distribution by voice). Only for Directors of this choir.
    """
    if not deps.check_choir_access(choir_id, current_user.id, db, required_role="DIRECTOR") and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="No tienes permisos de dirección en este coro")
    memberships = db.query(Membership).filter(Membership.choir_id == choir_id).all()
    
    stats = {
        "total": len(memberships),
        "voices": {
            VoicePart.SOPRANO: 0,
            VoicePart.ALTO: 0,
            VoicePart.TENOR: 0,
            VoicePart.BASS: 0,
            VoicePart.DIRECTOR: 0,
            VoicePart.SUBDIRECTOR: 0
        }
    }
    
    for m in memberships:
        stats["voices"][m.voice_part] += 1
        
    return stats
