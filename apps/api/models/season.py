from sqlalchemy import Column, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Season(Base):
    __tablename__ = "seasons"

    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    choir_id = Column(String, ForeignKey("choirs.id"), nullable=False, index=True)

    choir = relationship("Choir")
    projects = relationship("Project", back_populates="season", cascade="all, delete-orphan")
