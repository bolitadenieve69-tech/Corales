"""Pipeline management endpoints.

- GET /pipeline/status/{asset_id} — check processing status
- POST /pipeline/retry/{asset_id} — retry a failed job
- POST /pipeline/mapping/{edition_id} — save manual SATB mapping and re-process
"""

import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from models import Asset, Edition, User
from models.edition_part_mapping import EditionPartMapping
from schemas.pipeline import PipelineStatusResponse, MappingUpdateRequest
from api.deps import get_current_user, get_current_active_director
from services.pipeline.enqueue import enqueue_process_musicxml
from services.pipeline.audit import log_event

router = APIRouter(tags=["pipeline"])


@router.get("/status/{asset_id}", response_model=PipelineStatusResponse)
def get_pipeline_status(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the processing status of an asset."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    metadata = None
    if asset.metadata_json:
        try:
            metadata = json.loads(asset.metadata_json)
        except json.JSONDecodeError:
            pass

    return PipelineStatusResponse(
        asset_id=asset.id,
        edition_id=asset.edition_id,
        asset_type=asset.asset_type,
        processing_status=asset.processing_status,
        processing_error=asset.processing_error,
        metadata=metadata,
    )


@router.post("/retry/{asset_id}")
def retry_pipeline(
    asset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_director),
):
    """Manually retry processing a failed asset."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    if asset.processing_status not in ("ERROR", "NEEDS_MAPPING"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot retry: asset status is '{asset.processing_status}', expected 'ERROR' or 'NEEDS_MAPPING'"
        )

    # Reset status and enqueue
    asset.processing_status = "PENDING"
    asset.processing_error = None
    db.commit()

    job_id = enqueue_process_musicxml(asset.id)

    log_event(db, "JOB_STARTED", "asset", asset.id, {
        "action": "manual_retry",
        "triggered_by": current_user.id,
        "rq_job_id": job_id,
    }, user_id=current_user.id)

    return {"message": "Job re-enqueued", "job_id": job_id, "asset_id": asset.id}


@router.post("/mapping/{edition_id}")
def update_mapping(
    edition_id: str,
    request: MappingUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_director),
):
    """Save manual SATB mapping and re-process.
    
    Used when auto-detection fails (status=NEEDS_MAPPING) and the director
    manually assigns parts to voices.
    """
    edition = db.query(Edition).filter(Edition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=404, detail="Edition not found")

    # Validate voice assignments
    valid_voices = {"S", "A", "T", "B", "Other"}
    for m in request.mappings:
        if m.assigned_to not in valid_voices:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid voice '{m.assigned_to}'. Must be one of: {valid_voices}"
            )

    # Remove old mappings
    db.query(EditionPartMapping).filter(
        EditionPartMapping.edition_id == edition_id
    ).delete()

    # Save new mappings
    for m in request.mappings:
        db.add(EditionPartMapping(
            edition_id=edition_id,
            part_name=m.part_name,
            assigned_to=m.assigned_to,
            auto_detected=False,
        ))
    db.commit()

    log_event(db, "MAPPING_UPDATED", "edition", edition_id, {
        "mappings": [{"part": m.part_name, "voice": m.assigned_to} for m in request.mappings],
        "updated_by": current_user.id,
    }, user_id=current_user.id)

    # Find the MusicXML asset for this edition and re-enqueue
    musicxml_asset = db.query(Asset).filter(
        Asset.edition_id == edition_id,
        Asset.asset_type == "MUSICXML",
    ).first()

    job_id = None
    if musicxml_asset:
        musicxml_asset.processing_status = "PENDING"
        musicxml_asset.processing_error = None
        db.commit()
        job_id = enqueue_process_musicxml(musicxml_asset.id)

    return {
        "message": "Mapping saved",
        "edition_id": edition_id,
        "mappings_count": len(request.mappings),
        "reprocessing_job_id": job_id,
    }
