from sqlalchemy import Column, String, DateTime, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from ..database import Base


class EventType(str, enum.Enum):
    COMMUNICATION = "communication"
    DEADLINE = "deadline"
    FILING = "filing"
    HEARING = "hearing"
    CONTRACT_SIGNED = "contract_signed"
    BREACH_NOTICE = "breach_notice"
    CLIENT_CONTACT = "client_contact"
    INTERNAL_NOTE = "internal_note"
    DOCUMENT_RECEIVED = "document_received"
    SETTLEMENT = "settlement"
    TRIGGER_EVENT = "trigger_event"
    OTHER = "other"


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    matter_id = Column(String, ForeignKey("matters.id"), nullable=False, index=True)
    communication_id = Column(String, ForeignKey("communications.id"))
    event_date = Column(DateTime, nullable=False, index=True)
    event_type = Column(Enum(EventType), default=EventType.OTHER)
    title = Column(String(500), nullable=False)
    summary = Column(Text)
    source_references = Column(JSON, default=list)
    linked_documents = Column(JSON, default=list)
    associated_contacts = Column(JSON, default=list)
    is_confirmed = Column(String(10), default="false")
    extracted_from = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())

    matter = relationship("Matter", back_populates="timeline_events")
    communication = relationship("Communication", back_populates="timeline_events")
