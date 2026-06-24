from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.communication import Communication, LegalCategory, UrgencyLevel
from ..schemas.communication import IntakeRequest, IntakeResult, CommunicationResponse
from ..services.ingestion import IngestionService
from ..services.audit import AuditService

router = APIRouter(prefix="/intake", tags=["intake"])


@router.post("/", response_model=CommunicationResponse)
def submit_intake(data: IntakeRequest, db: Session = Depends(get_db)):
    """Submit a communication for intake processing (classify, summarize, extract, link)."""
    service = IngestionService(db)
    comm = service.process_communication(data.model_dump())
    AuditService(db).log(
        "intake_submitted", "communication", comm.id, comm.matter_id,
        action="intake", details={"source_type": data.source_type, "category": comm.category}
    )
    return comm


@router.get("/queue", response_model=List[CommunicationResponse])
def get_intake_queue(
    untriaged_only: bool = True,
    urgency: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db)
):
    """Get communications in the intake/triage queue."""
    query = db.query(Communication)
    if untriaged_only:
        query = query.filter(Communication.is_triaged == False)
    if urgency:
        query = query.filter(Communication.urgency == urgency)
    if category:
        query = query.filter(Communication.category == category)

    comms = query.order_by(Communication.received_at.desc()).limit(limit).all()
    return comms


@router.get("/all", response_model=List[CommunicationResponse])
def list_communications(
    matter_id: Optional[str] = None,
    category: Optional[str] = None,
    urgency: Optional[str] = None,
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """List all communications with optional filters."""
    query = db.query(Communication)
    if matter_id:
        query = query.filter(Communication.matter_id == matter_id)
    if category:
        query = query.filter(Communication.category == category)
    if urgency:
        query = query.filter(Communication.urgency == urgency)
    return query.order_by(Communication.received_at.desc()).offset(offset).limit(limit).all()


@router.get("/{comm_id}", response_model=CommunicationResponse)
def get_communication(comm_id: str, db: Session = Depends(get_db)):
    comm = db.query(Communication).filter(Communication.id == comm_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")
    return comm


@router.post("/{comm_id}/triage")
def triage_communication(
    comm_id: str,
    matter_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Mark a communication as triaged, optionally assigning to a matter."""
    comm = db.query(Communication).filter(Communication.id == comm_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")

    comm.is_triaged = True
    if matter_id:
        comm.matter_id = matter_id
    if assigned_to:
        comm.owner_recommendation = assigned_to

    db.commit()
    AuditService(db).log("communication_triaged", "communication", comm_id, matter_id, action="triage")
    return {"status": "triaged", "communication_id": comm_id}


@router.post("/{comm_id}/reprocess")
def reprocess_communication(comm_id: str, db: Session = Depends(get_db)):
    """Re-run AI intelligence pipeline on a communication."""
    comm = db.query(Communication).filter(Communication.id == comm_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")

    service = IngestionService(db)
    service._run_intelligence_pipeline(comm, {})
    db.commit()
    return {"status": "reprocessed", "communication_id": comm_id}


@router.get("/stats/summary")
def get_intake_stats(db: Session = Depends(get_db)):
    """Get intake queue statistics."""
    total = db.query(Communication).count()
    untriaged = db.query(Communication).filter(Communication.is_triaged == False).count()

    by_urgency = {}
    for urgency in UrgencyLevel:
        count = db.query(Communication).filter(Communication.urgency == urgency).count()
        by_urgency[urgency.value] = count

    by_category = {}
    for category in LegalCategory:
        count = db.query(Communication).filter(Communication.category == category).count()
        if count > 0:
            by_category[category.value] = count

    return {
        "total_communications": total,
        "untriaged": untriaged,
        "by_urgency": by_urgency,
        "by_category": by_category,
    }
