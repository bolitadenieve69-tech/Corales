from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid
from .base import Base

class PracticeStatus(str, enum.Enum):
    NUEVA = "NUEVA"
    EN_PROGRESO = "EN_PROGRESO"
    DOMINADA = "DOMINADA"

class PracticeProgress(Base):
    __tablename__ = "practice_progress"

    id = Column(String, primary_key=True, index=True, default=lambda: uuid.uuid4().hex)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    # Puede ser que el progreso esté asociado a un "project_repertoire_id" o a una "work_id"
    # Segun las instrucciones: "estado y minutos de estudio por coralista/obra" (o por "piece" dentro de un proyecto)
    # Lo vincularemos a la `work_id` para que el esfuerzo del coralista en una obra persista 
    # incluso si la obra se repite en otro proyecto.
    work_id = Column(String, ForeignKey("works.id"), nullable=False)
    
    status = Column(Enum(PracticeStatus), default=PracticeStatus.NUEVA, nullable=False)
    minutes_practiced = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    user = relationship("User")
    work = relationship("Work")
