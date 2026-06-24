from sqlalchemy import Column, String, DateTime, Boolean, Enum, JSON
from sqlalchemy.sql import func
import uuid
import enum
from ..database import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ATTORNEY = "attorney"
    PARALEGAL = "paralegal"
    LEGAL_OPS = "legal_ops"
    READ_ONLY = "read_only"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255))
    role = Column(Enum(UserRole), default=UserRole.ATTORNEY)
    is_active = Column(Boolean, default=True)
    practice_areas = Column(JSON, default=list)
    created_at = Column(DateTime, server_default=func.now())
    last_login = Column(DateTime)
