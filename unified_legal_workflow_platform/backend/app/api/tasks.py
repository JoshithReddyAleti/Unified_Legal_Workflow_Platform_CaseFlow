from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.task import Task, Deadline, TaskStatus, DeadlineStatus
from ..schemas.task import TaskCreate, TaskUpdate, TaskResponse, DeadlineCreate, DeadlineResponse
from ..services.audit import AuditService
import uuid

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=List[TaskResponse])
def list_tasks(
    matter_id: Optional[str] = None,
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if matter_id:
        query = query.filter(Task.matter_id == matter_id)
    if status:
        query = query.filter(Task.status == status)
    if assigned_to:
        query = query.filter(Task.assigned_to == assigned_to)
    if priority:
        query = query.filter(Task.priority == priority)
    return query.order_by(Task.due_date.asc().nullslast()).limit(limit).all()


@router.post("/", response_model=TaskResponse)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    task = Task(id=str(uuid.uuid4()), **data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    AuditService(db).log("task_created", "task", task.id, task.matter_id, action="create")
    return task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    updates = data.model_dump(exclude_none=True)
    if updates.get("status") == TaskStatus.COMPLETED and not task.completed_at:
        updates["completed_at"] = datetime.utcnow()

    for field, value in updates.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    AuditService(db).log("task_updated", "task", task_id, task.matter_id, action="update",
                         details={"changes": list(updates.keys())})
    return task


# Deadlines
@router.get("/deadlines/list", response_model=List[DeadlineResponse])
def list_deadlines(
    matter_id: Optional[str] = None,
    status: Optional[str] = None,
    upcoming_days: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Deadline)
    if matter_id:
        query = query.filter(Deadline.matter_id == matter_id)
    if status:
        query = query.filter(Deadline.status == status)
    if upcoming_days:
        cutoff = datetime.utcnow()
        from datetime import timedelta
        query = query.filter(
            Deadline.deadline_date >= cutoff,
            Deadline.deadline_date <= cutoff + timedelta(days=upcoming_days)
        )
    return query.order_by(Deadline.deadline_date.asc()).all()


@router.post("/deadlines/", response_model=DeadlineResponse)
def create_deadline(data: DeadlineCreate, db: Session = Depends(get_db)):
    deadline = Deadline(id=str(uuid.uuid4()), **data.model_dump())
    db.add(deadline)
    db.commit()
    db.refresh(deadline)
    AuditService(db).log("deadline_created", "deadline", deadline.id, deadline.matter_id, action="create")
    return deadline


@router.post("/deadlines/{deadline_id}/confirm")
def confirm_deadline(deadline_id: str, confirmed_by: str = "user", db: Session = Depends(get_db)):
    deadline = db.query(Deadline).filter(Deadline.id == deadline_id).first()
    if not deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    deadline.status = DeadlineStatus.CONFIRMED
    deadline.confirmed_by = confirmed_by
    deadline.confirmed_at = datetime.utcnow()
    db.commit()
    AuditService(db).log("deadline_confirmed", "deadline", deadline_id, deadline.matter_id,
                         action="confirm", details={"confirmed_by": confirmed_by})
    return {"status": "confirmed", "deadline_id": deadline_id}


@router.post("/deadlines/{deadline_id}/dismiss")
def dismiss_deadline(deadline_id: str, db: Session = Depends(get_db)):
    deadline = db.query(Deadline).filter(Deadline.id == deadline_id).first()
    if not deadline:
        raise HTTPException(status_code=404, detail="Deadline not found")
    deadline.status = DeadlineStatus.DISMISSED
    db.commit()
    return {"status": "dismissed", "deadline_id": deadline_id}
