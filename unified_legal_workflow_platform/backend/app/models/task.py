from sqlalchemy import Column, String, DateTime, Text, Enum, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from ..database import Base


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DeadlineStatus(str, enum.Enum):
    SUGGESTED = "suggested"
    CONFIRMED = "confirmed"
    DISMISSED = "dismissed"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    matter_id = Column(String, ForeignKey("matters.id"), index=True)
    communication_id = Column(String, ForeignKey("communications.id"))
    title = Column(String(500), nullable=False)
    description = Column(Text)
    assigned_to = Column(String(255))
    status = Column(Enum(TaskStatus), default=TaskStatus.PENDING)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    source_snippet = Column(Text)
    tags = Column(JSON, default=list)
    created_by = Column(String(255))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    matter = relationship("Matter", back_populates="tasks")
    communication = relationship("Communication", back_populates="tasks")


class Deadline(Base):
    __tablename__ = "deadlines"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    matter_id = Column(String, ForeignKey("matters.id"), index=True)
    communication_id = Column(String, ForeignKey("communications.id"))
    title = Column(String(500), nullable=False)
    description = Column(Text)
    deadline_date = Column(DateTime, nullable=False)
    status = Column(Enum(DeadlineStatus), default=DeadlineStatus.SUGGESTED)
    deadline_type = Column(String(100))
    source_snippet = Column(Text)
    confirmed_by = Column(String(255))
    confirmed_at = Column(DateTime)
    reminder_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    matter = relationship("Matter", back_populates="deadlines")
    communication = relationship("Communication", back_populates="deadlines")
