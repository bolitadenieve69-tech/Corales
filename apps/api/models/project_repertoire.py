from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class ProjectRepertoire(Base):
    __tablename__ = "project_repertoire"

    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    edition_id = Column(String, ForeignKey("editions.id"), nullable=True, index=True)
    
    # Placeholder for UI testing (antes de tener ediciones creadas)
    work_title = Column(String, nullable=True) 
    
    order = Column(Integer, default=0, nullable=False)

    project = relationship("Project", back_populates="repertoire")
    edition = relationship("Edition", back_populates="project_repertoire")
