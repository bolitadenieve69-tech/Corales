from sqlalchemy import Column, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from .base import Base

class DirectFeedback(Base):
    """
    Mensajes privados del Director a un Coralista.
    """
    __tablename__ = "directfeedback"

    sender_id = Column(String, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(String, ForeignKey("users.id"), nullable=False)
    choir_id = Column(String, ForeignKey("choirs.id"), nullable=False)
    work_id = Column(String, ForeignKey("works.id"), nullable=True) # Opcional: asociado a una obra
    content = Column(Text, nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)

    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
    choir = relationship("Choir")
    work = relationship("Work")
