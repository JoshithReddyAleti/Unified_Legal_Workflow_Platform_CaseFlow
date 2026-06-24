from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.matter import Matter, Client, MatterStatus
from ..models.task import Task, Deadline, TaskStatus, DeadlineStatus
from ..models.communication import Communication
from ..schemas.matter import MatterCreate, MatterUpdate, MatterResponse, MatterSummary, ClientCreate, ClientResponse
from ..services.audit import AuditService
import uuid

router = APIRouter(prefix="/matters", tags=["matters"])


@router.get("/", response_model=List[MatterSummary])
def list_matters(
    status: Optional[str] = None,
    matter_type: Optional[str] = None,
    assigned_to: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=200),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Matter)
    if status:
        query = query.filter(Matter.status == status)
    if matter_type:
        query = query.filter(Matter.matter_type == matter_type)
    if assigned_to:
        query = query.filter(Matter.assigned_to == assigned_to)
    if search:
        query = query.filter(Matter.title.ilike(f"%{search}%"))

    matters = query.order_by(Matter.updated_at.desc()).offset(offset).limit(limit).all()

    results = []
    for m in matters:
        open_tasks = db.query(Task).filter(
            Task.matter_id == m.id,
            Task.status.in_([TaskStatus.PENDING, TaskStatus.IN_PROGRESS])
        ).count()
        upcoming_deadlines = db.query(Deadline).filter(
            Deadline.matter_id == m.id,
            Deadline.status.in_([DeadlineStatus.SUGGESTED, DeadlineStatus.CONFIRMED]),
            Deadline.deadline_date >= datetime.utcnow()
        ).count()
        last_comm = db.query(Communication).filter(
            Communication.matter_id == m.id
        ).order_by(Communication.received_at.desc()).first()

        results.append(MatterSummary(
            id=m.id, title=m.title, matter_number=m.matter_number,
            status=m.status, matter_type=m.matter_type, assigned_to=m.assigned_to,
            client_name=m.client.name if m.client else None,
            open_tasks=open_tasks, upcoming_deadlines=upcoming_deadlines,
            last_activity=last_comm.received_at if last_comm else m.updated_at,
            created_at=m.created_at,
        ))
    return results


@router.post("/", response_model=MatterResponse)
def create_matter(data: MatterCreate, db: Session = Depends(get_db)):
    matter_count = db.query(Matter).count() + 1
    matter = Matter(
        id=str(uuid.uuid4()),
        title=data.title,
        matter_number=f"M-{datetime.utcnow().year}-{matter_count:04d}",
        client_id=data.client_id,
        matter_type=data.matter_type,
        description=data.description,
        assigned_to=data.assigned_to,
        tags=data.tags,
        status=MatterStatus.OPEN,
    )
    db.add(matter)
    db.commit()
    db.refresh(matter)
    AuditService(db).log("matter_created", "matter", matter.id, matter.id, action="create")
    return matter


@router.get("/{matter_id}", response_model=MatterResponse)
def get_matter(matter_id: str, db: Session = Depends(get_db)):
    matter = db.query(Matter).filter(Matter.id == matter_id).first()
    if not matter:
        raise HTTPException(status_code=404, detail="Matter not found")
    return matter


@router.patch("/{matter_id}", response_model=MatterResponse)
def update_matter(matter_id: str, data: MatterUpdate, db: Session = Depends(get_db)):
    matter = db.query(Matter).filter(Matter.id == matter_id).first()
    if not matter:
        raise HTTPException(status_code=404, detail="Matter not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(matter, field, value)
    db.commit()
    db.refresh(matter)
    AuditService(db).log("matter_updated", "matter", matter_id, matter_id, action="update")
    return matter


@router.get("/{matter_id}/stats")
def get_matter_stats(matter_id: str, db: Session = Depends(get_db)):
    matter = db.query(Matter).filter(Matter.id == matter_id).first()
    if not matter:
        raise HTTPException(status_code=404, detail="Matter not found")

    total_comms = db.query(Communication).filter(Communication.matter_id == matter_id).count()
    open_tasks = db.query(Task).filter(Task.matter_id == matter_id, Task.status.in_(["pending", "in_progress"])).count()
    total_deadlines = db.query(Deadline).filter(Deadline.matter_id == matter_id).count()
    upcoming_deadlines = db.query(Deadline).filter(
        Deadline.matter_id == matter_id,
        Deadline.status.in_(["suggested", "confirmed"]),
        Deadline.deadline_date >= datetime.utcnow()
    ).count()

    return {
        "matter_id": matter_id,
        "total_communications": total_comms,
        "open_tasks": open_tasks,
        "total_deadlines": total_deadlines,
        "upcoming_deadlines": upcoming_deadlines,
    }


# Client endpoints
@router.get("/clients/list", response_model=List[ClientResponse])
def list_clients(db: Session = Depends(get_db)):
    return db.query(Client).order_by(Client.name).all()


@router.post("/clients/", response_model=ClientResponse)
def create_client(data: ClientCreate, db: Session = Depends(get_db)):
    client = Client(id=str(uuid.uuid4()), **data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client
