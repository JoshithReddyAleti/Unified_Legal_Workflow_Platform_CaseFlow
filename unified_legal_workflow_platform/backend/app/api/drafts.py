from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from ..database import get_db
from ..models.communication import Communication
from ..models.matter import Matter
from ..intelligence.draft_generator import generate_draft_reply

router = APIRouter(prefix="/drafts", tags=["drafts"])


class DraftRequest(BaseModel):
    communication_id: str
    tone: str = "professional"
    matter_context: Optional[str] = None


class DraftResponse(BaseModel):
    subject: str
    body: str
    tone: str
    warnings: list[str]
    suggested_actions: list[str]
    requires_review: bool = True


@router.post("/generate", response_model=DraftResponse)
async def generate_draft(req: DraftRequest, db: Session = Depends(get_db)):
    comm = db.query(Communication).filter(Communication.id == req.communication_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")

    matter_context = req.matter_context
    if not matter_context and comm.matter_id:
        matter = db.query(Matter).filter(Matter.id == comm.matter_id).first()
        if matter:
            matter_context = f"{matter.title} ({matter.matter_number or matter.matter_type})"

    result = await generate_draft_reply(
        original_subject=comm.subject or "(no subject)",
        original_body=comm.body or "",
        sender=comm.sender or "Unknown",
        category=comm.category or "general_inquiry",
        summary=comm.summary or "",
        key_facts=comm.key_facts or [],
        tone=req.tone,
        matter_context=matter_context,
    )

    result["requires_review"] = True
    return result
