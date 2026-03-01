from sqlalchemy import Column, String, Date, Boolean, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .base import Base

class Project(Base):
    __tablename__ = "projects"

    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    date = Column(Date, nullable=True)
    is_published = Column(Boolean, default=False)
    
    choir_id = Column(String, ForeignKey("choirs.id"), nullable=False, index=True)
    season_id = Column(String, ForeignKey("seasons.id"), nullable=True, index=True)

    choir = relationship("Choir")
    season = relationship("Season", back_populates="projects")
    repertoire = relationship("ProjectRepertoire", back_populates="project", cascade="all, delete-orphan", order_by="ProjectRepertoire.order")
