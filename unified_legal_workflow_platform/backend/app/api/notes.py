from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.note import MatterNote
from ..schemas.note import NoteCreate, NoteResponse

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("/matters/{matter_id}", response_model=List[NoteResponse])
def list_notes(matter_id: str, db: Session = Depends(get_db)):
    return (
        db.query(MatterNote)
        .filter(MatterNote.matter_id == matter_id)
        .order_by(MatterNote.created_at.desc())
        .all()
    )


@router.post("/matters/{matter_id}", response_model=NoteResponse)
def create_note(matter_id: str, data: NoteCreate, db: Session = Depends(get_db)):
    note = MatterNote(matter_id=matter_id, **data.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}")
def delete_note(note_id: str, db: Session = Depends(get_db)):
    note = db.query(MatterNote).filter(MatterNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"ok": True}
