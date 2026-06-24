from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from ..models.knowledge import KnowledgeSourceType


class KnowledgeItemCreate(BaseModel):
    title: str
    source_type: KnowledgeSourceType
    content: str
    source_url: Optional[str] = None
    source_path: Optional[str] = None
    tags: List[str] = []
    practice_area: Optional[str] = None
    matter_id: Optional[str] = None


class KnowledgeItemResponse(BaseModel):
    id: str
    title: str
    source_type: KnowledgeSourceType
    source_url: Optional[str]
    tags: List[str]
    practice_area: Optional[str]
    is_approved: str
    content_summary: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


class KnowledgeQueryRequest(BaseModel):
    query: str
    matter_id: Optional[str] = None
    practice_area: Optional[str] = None
    top_k: int = 5


class SourceCitation(BaseModel):
    knowledge_item_id: str
    title: str
    source_type: str
    source_url: Optional[str]
    relevant_excerpt: str
    relevance_score: float = 0.0


class KnowledgeQueryResponse(BaseModel):
    query: str
    answer: str
    citations: List[SourceCitation]
    is_complete: bool
    uncertainty_notes: Optional[str] = None
    model_used: str
