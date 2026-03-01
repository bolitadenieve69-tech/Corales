from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class EditionPartMapping(Base):
    __tablename__ = "edition_part_mapping"

    edition_id = Column(String, ForeignKey("editions.id"), nullable=False, index=True)
    
    # Original part name from MusicXML (e.g. "Voce 1", "Soprano", "S")
    part_name = Column(String, nullable=False)
    
    # Assigned voice: S, A, T, B, Other
    assigned_to = Column(String, nullable=False)
    
    # True if auto-detected by the parser, False if manually assigned by director
    auto_detected = Column(Boolean, default=True)
    
    edition = relationship("Edition")
