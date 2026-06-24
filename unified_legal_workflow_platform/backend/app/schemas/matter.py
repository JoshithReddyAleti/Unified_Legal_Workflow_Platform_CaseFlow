from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from ..models.matter import MatterStatus, MatterType


class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    organization: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None


class ClientResponse(ClientCreate):
    id: str
    created_at: datetime
    model_config = {"from_attributes": True}


class MatterCreate(BaseModel):
    title: str
    client_id: Optional[str] = None
    matter_type: MatterType = MatterType.GENERAL
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    tags: List[str] = []


class MatterUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[MatterStatus] = None
    matter_type: Optional[MatterType] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    tags: Optional[List[str]] = None


class MatterSummary(BaseModel):
    id: str
    title: str
    matter_number: Optional[str]
    status: MatterStatus
    matter_type: MatterType
    assigned_to: Optional[str]
    client_name: Optional[str] = None
    open_tasks: int = 0
    upcoming_deadlines: int = 0
    last_activity: Optional[datetime] = None
    created_at: datetime
    model_config = {"from_attributes": True}


class MatterResponse(BaseModel):
    id: str
    title: str
    matter_number: Optional[str]
    status: MatterStatus
    matter_type: MatterType
    description: Optional[str]
    assigned_to: Optional[str]
    client: Optional[ClientResponse]
    tags: List[str]
    opened_date: datetime
    closed_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
