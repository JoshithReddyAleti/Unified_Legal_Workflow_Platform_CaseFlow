from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from ..models.note import NoteType


class NoteCreate(BaseModel):
    content: str
    note_type: NoteType = NoteType.GENERAL
    created_by: str = "attorney"


class NoteResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: str
    matter_id: str
    content: str
    note_type: NoteType
    created_by: str
    created_at: datetime
    updated_at: datetime
