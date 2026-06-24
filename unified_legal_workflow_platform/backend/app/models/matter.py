from sqlalchemy import Column, String, DateTime, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from ..database import Base


class MatterStatus(str, enum.Enum):
    OPEN = "open"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    CLOSED = "closed"


class MatterType(str, enum.Enum):
    LITIGATION = "litigation"
    CORPORATE = "corporate"
    EMPLOYMENT = "employment"
    IP = "ip"
    REAL_ESTATE = "real_estate"
    REGULATORY = "regulatory"
    GENERAL = "general"


class Client(Base):
    __tablename__ = "clients"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255))
    organization = Column(String(255))
    phone = Column(String(50))
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    matters = relationship("Matter", back_populates="client")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    matter_id = Column(String, ForeignKey("matters.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    role = Column(String(100))
    organization = Column(String(255))
    is_counterparty = Column(String(10), default="false")
    created_at = Column(DateTime, server_default=func.now())

    matter = relationship("Matter", back_populates="contacts")


class Matter(Base):
    __tablename__ = "matters"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(500), nullable=False, index=True)
    matter_number = Column(String(100), unique=True, index=True)
    client_id = Column(String, ForeignKey("clients.id"))
    status = Column(Enum(MatterStatus), default=MatterStatus.OPEN)
    matter_type = Column(Enum(MatterType), default=MatterType.GENERAL)
    description = Column(Text)
    assigned_to = Column(String(255))
    opened_date = Column(DateTime, server_default=func.now())
    closed_date = Column(DateTime)
    tags = Column(JSON, default=list)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    client = relationship("Client", back_populates="matters")
    contacts = relationship("Contact", back_populates="matter")
    communications = relationship("Communication", back_populates="matter")
    tasks = relationship("Task", back_populates="matter")
    deadlines = relationship("Deadline", back_populates="matter")
    timeline_events = relationship("TimelineEvent", back_populates="matter")
    knowledge_items = relationship("KnowledgeItem", back_populates="matter")
    notes = relationship("MatterNote", back_populates="matter", order_by="MatterNote.created_at.desc()")
