from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Edition(Base):
    __tablename__ = "editions"

    work_id = Column(String, ForeignKey("works.id"), nullable=False, index=True)
    publisher = Column(String, nullable=True) # CPDL, Durand, etc.
    notes = Column(String, nullable=True)
    
    work = relationship("Work", back_populates="editions")
    assets = relationship("Asset", back_populates="edition", cascade="all, delete-orphan")
    project_repertoire = relationship("ProjectRepertoire", back_populates="edition")
