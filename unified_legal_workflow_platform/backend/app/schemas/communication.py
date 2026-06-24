from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.communication import SourceType, UrgencyLevel, LegalCategory


class IntakeRequest(BaseModel):
    source_type: SourceType = SourceType.MANUAL
    subject: Optional[str] = None
    body: str
    sender: Optional[str] = None
    recipients: List[str] = []
    received_at: Optional[datetime] = None
    source_id: Optional[str] = None
    source_url: Optional[str] = None
    thread_id: Optional[str] = None
    matter_id: Optional[str] = None


class ExtractedEntity(BaseModel):
    dates: List[Dict[str, Any]] = []
    deadlines: List[Dict[str, Any]] = []
    tasks: List[Dict[str, Any]] = []
    parties: List[str] = []
    documents: List[str] = []
    legal_triggers: List[str] = []
    hearings: List[str] = []
    filings: List[str] = []


class IntakeResult(BaseModel):
    communication_id: str
    category: LegalCategory
    urgency: UrgencyLevel
    summary: str
    key_facts: List[str]
    open_questions: List[str]
    legal_issues: List[str]
    action_items: List[str]
    owner_recommendation: Optional[str]
    next_action: Optional[str]
    extracted_entities: ExtractedEntity
    matter_id: Optional[str]
    matter_suggestion: Optional[str]
    confidence: float = 0.0


class CommunicationCreate(IntakeRequest):
    pass


class CommunicationResponse(BaseModel):
    id: str
    matter_id: Optional[str]
    source_type: SourceType
    subject: Optional[str]
    body: Optional[str]
    sender: Optional[str]
    recipients: List[str]
    received_at: Optional[datetime]
    category: LegalCategory
    urgency: UrgencyLevel
    summary: Optional[str]
    key_facts: List[str]
    open_questions: List[str]
    legal_issues: List[str]
    action_items: List[str]
    extracted_entities: Optional[Dict[str, Any]]
    owner_recommendation: Optional[str]
    is_processed: bool
    is_triaged: bool
    created_at: datetime
    model_config = {"from_attributes": True}
