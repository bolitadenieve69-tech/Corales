from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Work(Base):
    __tablename__ = "works"

    title = Column(String, nullable=False, index=True)
    composer = Column(String, nullable=True, index=True)
    era = Column(String, nullable=True) # Renacimiento, Barroco, etc.
    genre = Column(String, nullable=True) # Sacro, Profano, etc.
    voice_format = Column(String, nullable=True) # SATB, SSA, etc.
    accompaniment = Column(String, nullable=True) # A cappella, Piano, etc.
    language = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    
    choir_id = Column(String, ForeignKey("choirs.id"), nullable=False, index=True)

    choir = relationship("Choir")
    editions = relationship("Edition", back_populates="work", cascade="all, delete-orphan")
