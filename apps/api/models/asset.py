from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from .base import Base

class Asset(Base):
    __tablename__ = "assets"
    __table_args__ = (
        UniqueConstraint('edition_id', 'asset_type', 'checksum', name='uq_asset_idempotency'),
    )

    edition_id = Column(String, ForeignKey("editions.id"), nullable=False, index=True)
    
    # Tipo de asset: 'PDF', 'AUDIO_SOPRANO', 'AUDIO_ALTO', 'AUDIO_TENOR', 'AUDIO_BASS', 'AUDIO_TUTTI', 'MIDI', 'MUSICXML'
    asset_type = Column(String, nullable=False, index=True) 
    
    # URL o Path interno (S3/MinIO key)
    file_url = Column(String, nullable=False)
    
    # Nombre de archivo original para mantener la referencia (ej: "Soprano - Sicut Cervus.mp3")
    original_filename = Column(String, nullable=True)

    # --- Pipeline processing fields (Tarea 11) ---
    # PENDING | RUNNING | OK | NEEDS_MAPPING | ERROR
    processing_status = Column(String, nullable=True, default="PENDING", index=True)
    processing_error = Column(String, nullable=True)
    # JSON: {job_id, attempt, started_at, finished_at, pipeline_version, inputs}
    metadata_json = Column(String, nullable=True)

    # --- Idempotency fields (Tarea 11.2) ---
    checksum = Column(String, nullable=True, index=True)  # SHA-256
    storage_key = Column(String, nullable=True)  # MinIO/S3 key
    size_bytes = Column(Integer, nullable=True)
    
    edition = relationship("Edition", back_populates="assets")
