"""Idempotent asset creation — check before upload (Tarea 11.2).

Before saving a generated asset:
1. Compute SHA-256 of the file
2. Check if an asset with the same (edition_id, asset_type, checksum) exists
3. If yes → reuse it (no upload)
4. If no → upload to storage and insert the new asset
"""

import os
import logging
from sqlalchemy.orm import Session

from models.asset import Asset
from .checksum import compute_sha256

logger = logging.getLogger(__name__)


def find_or_create_asset(
    db: Session,
    edition_id: str,
    asset_type: str,
    file_path: str,
    storage_key: str,
    file_url: str,
    upload_fn=None,
) -> tuple[Asset, bool]:
    """Find an existing asset by checksum or create a new one.

    Args:
        db: SQLAlchemy session
        edition_id: The edition this asset belongs to
        asset_type: e.g. "AUDIO_SOPRANO", "MIDI", etc.
        file_path: Local path to the generated file
        storage_key: S3/MinIO key for storage
        file_url: Public/internal URL for access
        upload_fn: Optional callable(file_path, storage_key) to upload to S3.
                   Only called if the asset is new.

    Returns:
        Tuple of (asset, created) where created is True if a new asset was made.
    """
    file_checksum = compute_sha256(file_path)
    file_size = os.path.getsize(file_path)

    # Check for existing asset with same signature
    existing = (
        db.query(Asset)
        .filter(
            Asset.edition_id == edition_id,
            Asset.asset_type == asset_type,
            Asset.checksum == file_checksum,
        )
        .first()
    )

    if existing:
        logger.info(
            f"Asset already exists (idempotent skip): "
            f"edition={edition_id} type={asset_type} checksum={file_checksum[:12]}..."
        )
        return existing, False

    # Upload to storage if upload function provided
    if upload_fn:
        upload_fn(file_path, storage_key)

    # Create new asset
    asset = Asset(
        edition_id=edition_id,
        asset_type=asset_type,
        file_url=file_url,
        original_filename=os.path.basename(file_path),
        checksum=file_checksum,
        storage_key=storage_key,
        size_bytes=file_size,
        processing_status="OK",
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    logger.info(
        f"New asset created: edition={edition_id} type={asset_type} "
        f"checksum={file_checksum[:12]}... size={file_size}"
    )
    return asset, True
