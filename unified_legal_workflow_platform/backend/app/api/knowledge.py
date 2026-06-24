from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.knowledge import KnowledgeItem
from ..schemas.knowledge import (
    KnowledgeItemCreate, KnowledgeItemResponse,
    KnowledgeQueryRequest, KnowledgeQueryResponse
)
from ..intelligence.legal_qa import LegalKnowledgeQA
from ..services.audit import AuditService
import uuid

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("/", response_model=List[KnowledgeItemResponse])
def list_knowledge(
    practice_area: Optional[str] = None,
    source_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(KnowledgeItem)
    if practice_area:
        query = query.filter(KnowledgeItem.practice_area == practice_area)
    if source_type:
        query = query.filter(KnowledgeItem.source_type == source_type)
    if search:
        query = query.filter(KnowledgeItem.title.ilike(f"%{search}%"))
    return query.order_by(KnowledgeItem.title).all()


@router.post("/", response_model=KnowledgeItemResponse)
def create_knowledge_item(data: KnowledgeItemCreate, db: Session = Depends(get_db)):
    item = KnowledgeItem(id=str(uuid.uuid4()), **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/query", response_model=KnowledgeQueryResponse)
def query_knowledge(request: KnowledgeQueryRequest, db: Session = Depends(get_db)):
    """Grounded legal Q&A against approved knowledge sources."""
    query_db = db.query(KnowledgeItem).filter(KnowledgeItem.is_approved == "true")

    if request.practice_area:
        query_db = query_db.filter(KnowledgeItem.practice_area == request.practice_area)
    if request.matter_id:
        from sqlalchemy import or_
        query_db = query_db.filter(
            or_(KnowledgeItem.matter_id == request.matter_id, KnowledgeItem.matter_id == None)
        )

    all_items = query_db.all()

    qa = LegalKnowledgeQA()
    items_dicts = [
        {
            "id": item.id, "title": item.title, "source_type": item.source_type,
            "source_url": item.source_url, "content": item.content,
            "content_summary": item.content_summary, "tags": item.tags or [],
        }
        for item in all_items
    ]

    relevant_items = qa.find_relevant_sources(request.query, items_dicts)
    result = qa.answer(request.query, relevant_items[:request.top_k])

    AuditService(db).log(
        "knowledge_query", "knowledge", None, request.matter_id,
        action="query", details={"query": request.query[:200]},
        ai_model_used=result.get("model_used"),
        source_references=[c.get("knowledge_item_id") for c in result.get("citations", [])]
    )

    return KnowledgeQueryResponse(
        query=request.query,
        answer=result["answer"],
        citations=result["citations"],
        is_complete=result["is_complete"],
        uncertainty_notes=result.get("uncertainty_notes"),
        model_used=result.get("model_used", "claude-sonnet-4-6"),
    )
