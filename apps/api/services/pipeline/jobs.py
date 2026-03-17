"""Pipeline jobs — the 3 stages of MusicXML processing (Tarea 11.4 + 11.6).

Each job:
  1. Acquires a Redis lock (11.3)
  2. Updates asset status to RUNNING
  3. Processes in a temp directory (11.6)
  4. Uses idempotent asset creation via checksum (11.2)
  5. Logs audit events (11.7)
  6. Cleans up temp files in finally block
  7. Classifies errors as retryable vs permanent (11.4)

process_musicxml uses music21 for real parsing.
generate_midis and render_audio remain as placeholders.
"""

import json
import os
import shutil
import tempfile
import uuid
import logging
from datetime import datetime, timezone

from core.config import settings
from core.database import SessionLocal
from models.asset import Asset
from services.storage import storage_service
from .locks import PipelineLock
from .idempotency import find_or_create_asset
from .retry import is_retryable, MappingRequired
from .audit import log_event
from .config import PIPELINE_VERSION

logger = logging.getLogger(__name__)

# Shared lock instance
_lock = PipelineLock(settings.REDIS_URL)

# Retry configuration (used by RQ)
RETRY_DELAYS = [30, 120, 600]  # 30s, 2min, 10min
MAX_RETRIES = 3


def _get_job_dir(job_id: str) -> str:
    """Create and return a temp directory for this job (11.6)."""
    job_dir = os.path.join(tempfile.gettempdir(), "pipeline", job_id)
    os.makedirs(job_dir, exist_ok=True)
    return job_dir


def _update_asset_status(
    db, asset_id: str, status: str, error: str = None,
    job_id: str = None, attempt: int = 1,
):
    """Update an asset's processing status and metadata (11.1)."""
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        logger.error(f"Asset {asset_id} not found")
        return

    asset.processing_status = status
    asset.processing_error = error

    # Build/update metadata
    meta = json.loads(asset.metadata_json) if asset.metadata_json else {}
    meta.update({
        "job_id": job_id or meta.get("job_id"),
        "attempt": attempt,
        "pipeline_version": PIPELINE_VERSION,
    })
    if status == "RUNNING":
        meta["started_at"] = datetime.now(timezone.utc).isoformat()
    elif status in ("OK", "ERROR", "NEEDS_MAPPING"):
        meta["finished_at"] = datetime.now(timezone.utc).isoformat()

    asset.metadata_json = json.dumps(meta)
    db.commit()


# ──────────────────────────────────────────────
# Job 1: Process MusicXML
# ──────────────────────────────────────────────

def process_musicxml(asset_id: str, attempt: int = 1):
    """Parse a MusicXML file, detect parts, and determine SATB mapping.
    
    If parts are clear → status OK
    If ambiguous → status NEEDS_MAPPING (no retry)
    If XML is corrupt → status ERROR (no retry)
    """
    job_id = uuid.uuid4().hex
    job_dir = _get_job_dir(job_id)
    db = SessionLocal()
    stage = "process_musicxml"

    try:
        # 11.3 — Acquire lock
        if not _lock.acquire(stage, asset_id, ttl_seconds=600):
            logger.info(f"Job {stage}:{asset_id} already running, skipping")
            return

        # 11.1 — Mark as RUNNING
        _update_asset_status(db, asset_id, "RUNNING", job_id=job_id, attempt=attempt)

        # 11.7 — Audit
        log_event(db, "JOB_STARTED", "asset", asset_id, {
            "stage": stage, "job_id": job_id, "attempt": attempt,
        })

        # ──── Real MusicXML processing with music21 ────
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            raise ValueError(f"Asset {asset_id} not found")

        # 1. Download MusicXML to temp dir
        remote_path = asset.file_url
        local_path = os.path.join(job_dir, os.path.basename(remote_path))
        storage_service.download_file(remote_path, local_path)

        # 2. Parse with music21
        from .musicxml_parser import parse_musicxml, auto_map_satb
        parsed = parse_musicxml(local_path)

        # 3. Attempt auto-mapping
        mapping = auto_map_satb(parsed["parts"])

        if mapping is None:
            # Store partial metadata so the director knows what was found
            meta = json.loads(asset.metadata_json) if asset.metadata_json else {}
            meta["parsed"] = parsed
            asset.metadata_json = json.dumps(meta)
            db.commit()
            raise MappingRequired(
                f"Cannot auto-map {parsed['part_count']} parts: "
                f"{[p['name'] for p in parsed['parts']]}"
            )

        # 4. Save mapping to DB
        from models.edition_part_mapping import EditionPartMapping
        # Remove old mappings for this edition
        db.query(EditionPartMapping).filter(
            EditionPartMapping.edition_id == asset.edition_id
        ).delete()
        
        for part_name, voice in mapping.items():
            db.add(EditionPartMapping(
                edition_id=asset.edition_id,
                part_name=part_name,
                assigned_to=voice,
                auto_detected=True,
            ))

        # 5. Store parsed metadata in the asset
        meta = json.loads(asset.metadata_json) if asset.metadata_json else {}
        meta["parsed"] = parsed
        meta["mapping"] = mapping
        asset.metadata_json = json.dumps(meta)
        db.commit()

        logger.info(f"MusicXML processed: {parsed['part_count']} parts, mapping={mapping}")
        # ──── END MusicXML processing ────

        # 11.1 — Mark as OK
        _update_asset_status(db, asset_id, "OK", job_id=job_id, attempt=attempt)

        # 11.7 — Audit success
        log_event(db, "JOB_SUCCEEDED", "asset", asset_id, {
            "stage": stage, "job_id": job_id, "attempt": attempt,
        })

        # ── Chain: auto-enqueue MIDI generation ──
        from .enqueue import enqueue_generate_midis
        enqueue_generate_midis(asset.edition_id)
        logger.info(f"Chained: enqueued generate_midis for edition {asset.edition_id}")

    except MappingRequired as e:
        # Non-retryable: needs user intervention
        _update_asset_status(db, asset_id, "NEEDS_MAPPING", str(e), job_id, attempt)
        log_event(db, "JOB_FAILED", "asset", asset_id, {
            "stage": stage, "error": str(e), "retryable": False,
        })
        logger.warning(f"Mapping required for asset {asset_id}: {e}")

    except Exception as e:
        if is_retryable(e) and attempt < MAX_RETRIES:
            _update_asset_status(db, asset_id, "ERROR", str(e), job_id, attempt)
            log_event(db, "JOB_FAILED", "asset", asset_id, {
                "stage": stage, "error": str(e), "retryable": True, "attempt": attempt,
            })
            raise  # Let RQ handle the retry with backoff

        # Permanent failure
        _update_asset_status(db, asset_id, "ERROR", str(e), job_id, attempt)
        log_event(db, "JOB_FAILED", "asset", asset_id, {
            "stage": stage, "error": str(e), "retryable": False,
        })
        logger.error(f"Permanent failure processing asset {asset_id}: {e}")

    finally:
        # 11.3 — Release lock
        _lock.release(stage, asset_id)
        # 11.6 — Clean up temp dir
        if os.path.exists(job_dir):
            shutil.rmtree(job_dir, ignore_errors=True)
            logger.info(f"Cleaned up temp dir: {job_dir}")
        db.close()


# ──────────────────────────────────────────────
# Job 2: Generate MIDIs
# ──────────────────────────────────────────────

def generate_midis(edition_id: str, attempt: int = 1):
    """Generate MIDI_TUTTI and per-voice MIDI files for an edition.
    
    Uses idempotent asset creation to prevent duplicates on retry.
    """
    job_id = uuid.uuid4().hex
    job_dir = _get_job_dir(job_id)
    db = SessionLocal()
    stage = "generate_midis"

    try:
        if not _lock.acquire(stage, edition_id, ttl_seconds=900):
            logger.info(f"Job {stage}:{edition_id} already running, skipping")
            return

        log_event(db, "JOB_STARTED", "edition", edition_id, {
            "stage": stage, "job_id": job_id, "attempt": attempt,
        })

        # ──── Real MIDI generation with music21 ────
        # 1. Find the MusicXML asset for this edition
        musicxml_asset = db.query(Asset).filter(
            Asset.edition_id == edition_id,
            Asset.asset_type == "MUSICXML",
            Asset.processing_status == "OK",
        ).first()
        if not musicxml_asset:
            raise ValueError(f"No processed MusicXML found for edition {edition_id}")

        # 2. Load the SATB mapping
        from models.edition_part_mapping import EditionPartMapping
        mappings = db.query(EditionPartMapping).filter(
            EditionPartMapping.edition_id == edition_id
        ).all()
        if not mappings:
            raise ValueError(f"No SATB mapping found for edition {edition_id}")

        mapping_dict = {m.part_name: m.assigned_to for m in mappings}

        # 3. Download MusicXML to job dir and generate MIDIs
        remote_xml_path = musicxml_asset.file_url
        local_xml = os.path.join(job_dir, os.path.basename(remote_xml_path))
        storage_service.download_file(remote_xml_path, local_xml)

        from .midi_generator import generate_all_midis
        midi_dir = os.path.join(job_dir, "midis")
        generated_midis = generate_all_midis(local_xml, midi_dir, mapping_dict)

        # 4. Save each generated MIDI using idempotent asset creation
        for asset_type, midi_path in generated_midis.items():
            dest_filename = f"{edition_id}_{asset_type}.mid"
            remote_path = f"editions/{edition_id}/{dest_filename}"
            
            # Upload to storage
            storage_path = storage_service.upload_file(midi_path, remote_path)

            asset, created = find_or_create_asset(
                db, edition_id, asset_type,
                midi_path, # local path for checksum
                remote_path, # storage_key
                storage_path, # file_url/path stored in DB
            )
            if created:
                log_event(db, "ASSET_GENERATED", "asset", asset.id, {
                    "type": asset_type, "checksum": asset.checksum,
                })

        logger.info(f"Generated {len(generated_midis)} MIDIs for edition {edition_id}")
        # ──── END MIDI generation ────

        log_event(db, "JOB_SUCCEEDED", "edition", edition_id, {
            "stage": stage, "job_id": job_id, "attempt": attempt,
            "midi_count": len(generated_midis),
        })

        # ── Chain: auto-enqueue audio rendering ──
        from .enqueue import enqueue_render_audio
        enqueue_render_audio(edition_id)
        logger.info(f"Chained: enqueued render_audio for edition {edition_id}")

    except Exception as e:
        if is_retryable(e) and attempt < MAX_RETRIES:
            log_event(db, "JOB_FAILED", "edition", edition_id, {
                "stage": stage, "error": str(e), "retryable": True, "attempt": attempt,
            })
            raise

        log_event(db, "JOB_FAILED", "edition", edition_id, {
            "stage": stage, "error": str(e), "retryable": False,
        })
        logger.error(f"Permanent failure generating MIDIs for edition {edition_id}: {e}")

    finally:
        _lock.release(stage, edition_id)
        if os.path.exists(job_dir):
            shutil.rmtree(job_dir, ignore_errors=True)
        db.close()


# ──────────────────────────────────────────────
# Job 3: Render Audio
# ──────────────────────────────────────────────

def render_audio(edition_id: str, attempt: int = 1):
    """Render MIDI files to audio (MP3) using FluidSynth + ffmpeg.
    
    Uses idempotent asset creation to prevent duplicates on retry.
    """
    job_id = uuid.uuid4().hex
    job_dir = _get_job_dir(job_id)
    db = SessionLocal()
    stage = "render_audio"

    try:
        if not _lock.acquire(stage, edition_id, ttl_seconds=1800):
            logger.info(f"Job {stage}:{edition_id} already running, skipping")
            return

        log_event(db, "JOB_STARTED", "edition", edition_id, {
            "stage": stage, "job_id": job_id, "attempt": attempt,
        })

        # ──── Real audio rendering with FluidSynth + ffmpeg ────
        from .audio_renderer import check_dependencies, render_midi_to_mp3

        # 0. Check dependencies
        deps = check_dependencies()
        if not deps.get("fluidsynth"):
            raise FileNotFoundError(
                "FluidSynth not installed. Install with: brew install fluidsynth"
            )
        if not deps.get("ffmpeg"):
            raise FileNotFoundError(
                "ffmpeg not installed. Install with: brew install ffmpeg"
            )

        # 1. Find all MIDI assets for this edition
        midi_assets = db.query(Asset).filter(
            Asset.edition_id == edition_id,
            Asset.asset_type.like("MIDI_%"),
        ).all()

        if not midi_assets:
            raise ValueError(f"No MIDI assets found for edition {edition_id}")

        audio_count = 0

        # 2. Render each MIDI to MP3
        for midi_asset in midi_assets:
            # Download MIDI first
            local_midi = os.path.join(job_dir, os.path.basename(midi_asset.file_url))
            storage_service.download_file(midi_asset.file_url, local_midi)

            # Map MIDI type to AUDIO type
            audio_type = midi_asset.asset_type.replace("MIDI_", "AUDIO_")
            
            mp3_filename = f"{edition_id}_{audio_type}.mp3"
            mp3_job_path = os.path.join(job_dir, mp3_filename)

            render_midi_to_mp3(local_midi, mp3_job_path)

            # Upload to storage
            remote_path = f"editions/{edition_id}/{mp3_filename}"
            storage_path = storage_service.upload_file(mp3_job_path, remote_path)

            asset, created = find_or_create_asset(
                db, edition_id, audio_type,
                mp3_job_path, # local path for checksum
                remote_path, # storage_key
                storage_path, # file_url/path stored in DB
            )
            if created:
                log_event(db, "ASSET_GENERATED", "asset", asset.id, {
                    "type": audio_type, "checksum": asset.checksum,
                })
                audio_count += 1

        logger.info(f"Rendered {audio_count} audio files for edition {edition_id}")
        # ──── END audio rendering ────

        log_event(db, "JOB_SUCCEEDED", "edition", edition_id, {
            "stage": stage, "job_id": job_id, "attempt": attempt,
        })

    except Exception as e:
        if is_retryable(e) and attempt < MAX_RETRIES:
            log_event(db, "JOB_FAILED", "edition", edition_id, {
                "stage": stage, "error": str(e), "retryable": True, "attempt": attempt,
            })
            raise

        log_event(db, "JOB_FAILED", "edition", edition_id, {
            "stage": stage, "error": str(e), "retryable": False,
        })
        logger.error(f"Permanent failure rendering audio for edition {edition_id}: {e}")

    finally:
        _lock.release(stage, edition_id)
        if os.path.exists(job_dir):
            shutil.rmtree(job_dir, ignore_errors=True)
        db.close()
