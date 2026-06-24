from sqlalchemy import Column, String, DateTime, Text, Enum, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from ..database import Base


class SourceType(str, enum.Enum):
    OUTLOOK = "outlook"
    GMAIL = "gmail"
    TEAMS = "teams"
    SLACK = "slack"
    UPLOAD = "upload"
    MANUAL = "manual"
    MOCK = "mock"


class UrgencyLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class LegalCategory(str, enum.Enum):
    CONTRACT_REVIEW = "contract_review"
    LITIGATION_SUPPORT = "litigation_support"
    PRIVACY_DATA = "privacy_data"
    EMPLOYMENT = "employment"
    COMMERCIAL_DISPUTE = "commercial_dispute"
    COMPLIANCE = "compliance"
    POLICY_QUESTION = "policy_question"
    GENERAL_INQUIRY = "general_inquiry"
    UNCLASSIFIED = "unclassified"


class Communication(Base):
    __tablename__ = "communications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    matter_id = Column(String, ForeignKey("matters.id"), index=True)
    source_type = Column(Enum(SourceType), nullable=False)
    source_id = Column(String(500))
    source_url = Column(String(1000))

    # Raw content
    subject = Column(String(500))
    body = Column(Text)
    sender = Column(String(255))
    recipients = Column(JSON, default=list)
    received_at = Column(DateTime)
    thread_id = Column(String(255), index=True)

    # Intelligence outputs
    category = Column(Enum(LegalCategory), default=LegalCategory.UNCLASSIFIED)
    urgency = Column(Enum(UrgencyLevel), default=UrgencyLevel.LOW)
    summary = Column(Text)
    key_facts = Column(JSON, default=list)
    open_questions = Column(JSON, default=list)
    legal_issues = Column(JSON, default=list)
    action_items = Column(JSON, default=list)
    extracted_entities = Column(JSON, default=dict)
    owner_recommendation = Column(String(255))
    next_action = Column(Text)

    # Processing state
    is_processed = Column(Boolean, default=False)
    processing_error = Column(Text)
    is_triaged = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    matter = relationship("Matter", back_populates="communications")
    attachments = relationship("CommunicationAttachment", back_populates="communication")
    timeline_events = relationship("TimelineEvent", back_populates="communication")
    tasks = relationship("Task", back_populates="communication")
    deadlines = relationship("Deadline", back_populates="communication")


class CommunicationAttachment(Base):
    __tablename__ = "communication_attachments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    communication_id = Column(String, ForeignKey("communications.id"), nullable=False)
    filename = Column(String(500))
    content_type = Column(String(100))
    size_bytes = Column(String(50))
    source_url = Column(String(1000))
    extracted_text = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    communication = relationship("Communication", back_populates="attachments")
