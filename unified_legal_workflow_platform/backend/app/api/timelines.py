from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.timeline import TimelineEvent, EventType
from ..models.matter import Matter
from ..schemas.timeline import TimelineEventResponse, TimelineResponse
import uuid

router = APIRouter(prefix="/timelines", tags=["timelines"])


@router.get("/{matter_id}", response_model=TimelineResponse)
def get_matter_timeline(
    matter_id: str,
    event_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    matter = db.query(Matter).filter(Matter.id == matter_id).first()
    if not matter:
        raise HTTPException(status_code=404, detail="Matter not found")

    query = db.query(TimelineEvent).filter(TimelineEvent.matter_id == matter_id)

    if event_type:
        query = query.filter(TimelineEvent.event_type == event_type)
    if start_date:
        query = query.filter(TimelineEvent.event_date >= start_date)
    if end_date:
        query = query.filter(TimelineEvent.event_date <= end_date)

    events = query.order_by(TimelineEvent.event_date.asc()).all()

    date_start = events[0].event_date if events else None
    date_end = events[-1].event_date if events else None

    return TimelineResponse(
        matter_id=matter_id,
        matter_title=matter.title,
        events=events,
        total_events=len(events),
        date_range_start=date_start,
        date_range_end=date_end,
    )


@router.post("/{matter_id}/events")
def add_timeline_event(
    matter_id: str,
    event_date: datetime,
    event_type: str,
    title: str,
    summary: str = "",
    communication_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    matter = db.query(Matter).filter(Matter.id == matter_id).first()
    if not matter:
        raise HTTPException(status_code=404, detail="Matter not found")

    event_type_enum = EventType.OTHER
    try:
        event_type_enum = EventType(event_type)
    except ValueError:
        pass

    event = TimelineEvent(
        id=str(uuid.uuid4()),
        matter_id=matter_id,
        communication_id=communication_id,
        event_date=event_date,
        event_type=event_type_enum,
        title=title,
        summary=summary,
        is_confirmed="true",
        extracted_from="manual",
    )
    db.add(event)
    db.commit()
    return {"id": event.id, "status": "created"}
