from pydantic import BaseModel, ConfigDict
from typing import Optional, List


class PartMappingItem(BaseModel):
    part_name: str
    assigned_to: str  # S, A, T, B, Other


class PipelineStatusResponse(BaseModel):
    asset_id: str
    edition_id: str
    asset_type: str
    processing_status: Optional[str] = None
    processing_error: Optional[str] = None
    metadata: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


class MappingUpdateRequest(BaseModel):
    mappings: List[PartMappingItem]
