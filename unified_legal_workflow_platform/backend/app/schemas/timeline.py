from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.timeline import EventType


class TimelineEventResponse(BaseModel):
    id: str
    matter_id: str
    communication_id: Optional[str]
    event_date: datetime
    event_type: EventType
    title: str
    summary: Optional[str]
    source_references: List[Dict[str, Any]]
    linked_documents: List[str]
    associated_contacts: List[str]
    is_confirmed: str
    created_at: datetime
    model_config = {"from_attributes": True}


class TimelineResponse(BaseModel):
    matter_id: str
    matter_title: str
    events: List[TimelineEventResponse]
    total_events: int
    date_range_start: Optional[datetime]
    date_range_end: Optional[datetime]
