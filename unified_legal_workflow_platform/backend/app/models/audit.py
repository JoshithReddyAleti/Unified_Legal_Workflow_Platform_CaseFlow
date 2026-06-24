from sqlalchemy import Column, String, DateTime, Text, JSON
from sqlalchemy.sql import func
import uuid
from ..database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(100))
    entity_id = Column(String(255), index=True)
    matter_id = Column(String(255), index=True)
    user_id = Column(String(255))
    action = Column(String(100))
    details = Column(JSON, default=dict)
    ai_model_used = Column(String(100))
    source_references = Column(JSON, default=list)
    ip_address = Column(String(50))
    created_at = Column(DateTime, server_default=func.now(), index=True)
