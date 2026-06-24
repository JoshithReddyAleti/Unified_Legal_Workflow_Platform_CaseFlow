from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.task import TaskStatus, TaskPriority, DeadlineStatus


class TaskCreate(BaseModel):
    matter_id: str
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: Optional[datetime] = None
    communication_id: Optional[str] = None
    source_snippet: Optional[str] = None
    tags: List[str] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None


class TaskResponse(BaseModel):
    id: str
    matter_id: str
    title: str
    description: Optional[str]
    assigned_to: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    source_snippet: Optional[str]
    tags: List[str]
    communication_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class DeadlineCreate(BaseModel):
    matter_id: str
    title: str
    description: Optional[str] = None
    deadline_date: datetime
    deadline_type: Optional[str] = None
    communication_id: Optional[str] = None
    source_snippet: Optional[str] = None


class DeadlineResponse(BaseModel):
    id: str
    matter_id: str
    title: str
    description: Optional[str]
    deadline_date: datetime
    status: DeadlineStatus
    deadline_type: Optional[str]
    source_snippet: Optional[str]
    confirmed_by: Optional[str]
    confirmed_at: Optional[datetime]
    communication_id: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}
