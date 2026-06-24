from sqlalchemy import Column, String, DateTime, Text, Enum, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from ..database import Base


class KnowledgeSourceType(str, enum.Enum):
    SHAREPOINT = "sharepoint"
    GOOGLE_DRIVE = "google_drive"
    UPLOADED = "uploaded"
    MANUAL = "manual"
    PLAYBOOK = "playbook"
    POLICY = "policy"
    TEMPLATE = "template"
    PRIOR_MATTER = "prior_matter"


class KnowledgeItem(Base):
    __tablename__ = "knowledge_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    matter_id = Column(String, ForeignKey("matters.id"))
    title = Column(String(500), nullable=False, index=True)
    source_type = Column(Enum(KnowledgeSourceType), nullable=False)
    source_url = Column(String(1000))
    source_path = Column(String(1000))
    content = Column(Text)
    content_summary = Column(Text)
    tags = Column(JSON, default=list)
    practice_area = Column(String(100))
    is_approved = Column(String(10), default="false")
    approved_by = Column(String(255))
    approved_at = Column(DateTime)
    embedding_json = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    matter = relationship("Matter", back_populates="knowledge_items")
