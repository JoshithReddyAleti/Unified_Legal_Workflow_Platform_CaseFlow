from sqlalchemy import Column, String, DateTime, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from ..database import Base


class NoteType(str, enum.Enum):
    GENERAL = "general"
    STRATEGY = "strategy"
    OBSERVATION = "observation"
    RISK = "risk"


class MatterNote(Base):
    __tablename__ = "matter_notes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    matter_id = Column(String, ForeignKey("matters.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    note_type = Column(Enum(NoteType), default=NoteType.GENERAL)
    created_by = Column(String(255), default="attorney")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    matter = relationship("Matter", back_populates="notes")
