from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..models.audit import AuditLog
from ..services.audit import AuditService

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/logs")
def get_audit_logs(
    matter_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if matter_id:
        query = query.filter(AuditLog.matter_id == matter_id)
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if event_type:
        query = query.filter(AuditLog.event_type == event_type)

    logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()
    return [
        {
            "id": log.id, "event_type": log.event_type, "entity_type": log.entity_type,
            "entity_id": log.entity_id, "matter_id": log.matter_id, "action": log.action,
            "details": log.details, "ai_model_used": log.ai_model_used,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]
