from pydantic import BaseModel, ConfigDict
from typing import Optional

class AssetBase(BaseModel):
    edition_id: str
    asset_type: str
    file_url: str
    original_filename: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    asset_type: Optional[str] = None
    file_url: Optional[str] = None
    original_filename: Optional[str] = None

class AssetSchema(AssetBase):
    id: str
    processing_status: Optional[str] = None
    processing_error: Optional[str] = None
    checksum: Optional[str] = None
    size_bytes: Optional[int] = None
    
    model_config = ConfigDict(from_attributes=True)

class AssetUploadResponse(BaseModel):
    """Response for MusicXML upload — includes pipeline job info."""
    id: str
    edition_id: str
    asset_type: str
    file_url: str
    original_filename: Optional[str] = None
    processing_status: str
    message: str

    model_config = ConfigDict(from_attributes=True)
