#!/usr/bin/env python3
"""CaseFlow MCP Server — exposes all legal intelligence as MCP tools.

Connects directly to the same SQLite database as the FastAPI backend.
Run as a stdio server for Claude Desktop or any MCP-compatible client.

Usage:
    cd mcp-server
    python server.py
"""

import sys
import os
import json
import asyncio
from pathlib import Path
from datetime import datetime

# Add backend to Python path so we can reuse all models, services, intelligence
BACKEND_DIR = str(Path(__file__).parent.parent / "backend")
sys.path.insert(0, BACKEND_DIR)

# Change working directory to backend so relative DB path resolves correctly
os.chdir(BACKEND_DIR)

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# Backend imports (after path fix)
from app.database import SessionLocal, engine, Base
from app.models.matter import Matter, Client, MatterStatus, MatterType
from app.models.communication import Communication, SourceType, LegalCategory, UrgencyLevel
from app.models.task import Task, Deadline, TaskStatus, TaskPriority, DeadlineStatus
from app.models.timeline import TimelineEvent, EventType
from app.models.knowledge import KnowledgeItem
from app.models.audit import AuditLog
from app.services.ingestion import IngestionService
from app.services.audit import AuditService
from app.intelligence.intake_classifier import IntakeClassifier
from app.intelligence.summarizer import CommunicationSummarizer
from app.intelligence.extractor import EntityExtractor
from app.intelligence.legal_qa import LegalKnowledgeQA
from app.intelligence import llm_client
from app.config import settings
import uuid

# Ensure tables exist on first run
Base.metadata.create_all(bind=engine)

server = Server("caseflow-mcp")


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _json(obj) -> list[TextContent]:
    return [TextContent(type="text", text=json.dumps(obj, default=str, indent=2))]


def _err(msg: str) -> list[TextContent]:
    return [TextContent(type="text", text=json.dumps({"error": msg}))]


# ─── Tool Definitions ─────────────────────────────────────────────────────────

TOOLS = [
    # ── Matter Management ──────────────────────────────────────────────────
    Tool(
        name="list_matters",
        description="List legal matters. Filter by status (open/active/on_hold/closed), type, or search by title.",
        inputSchema={
            "type": "object",
            "properties": {
                "status": {"type": "string", "enum": ["open", "active", "on_hold", "closed"], "description": "Filter by matter status"},
                "matter_type": {"type": "string", "enum": ["litigation", "corporate", "employment", "ip", "real_estate", "regulatory", "general"]},
                "search": {"type": "string", "description": "Search in matter titles"},
                "limit": {"type": "integer", "default": 20, "maximum": 100},
            },
        },
    ),
    Tool(
        name="get_matter",
        description="Get a specific matter by ID including full details, open tasks count, upcoming deadlines, and recent communications.",
        inputSchema={
            "type": "object",
            "required": ["matter_id"],
            "properties": {
                "matter_id": {"type": "string", "description": "The matter UUID"},
            },
        },
    ),
    Tool(
        name="create_matter",
        description="Create a new legal matter.",
        inputSchema={
            "type": "object",
            "required": ["title"],
            "properties": {
                "title": {"type": "string"},
                "matter_type": {"type": "string", "enum": ["litigation", "corporate", "employment", "ip", "real_estate", "regulatory", "general"], "default": "general"},
                "description": {"type": "string"},
                "assigned_to": {"type": "string"},
                "client_name": {"type": "string", "description": "If provided, creates a new client record linked to this matter"},
            },
        },
    ),

    # ── AI Intelligence Pipeline ───────────────────────────────────────────
    Tool(
        name="process_intake",
        description=(
            "Run the full AI intake pipeline on a communication: "
            "classify legal category + urgency → link to matter → summarize → extract deadlines/tasks/parties → "
            "create timeline events. Returns complete AI analysis. "
            "This is the primary tool for ingesting new legal communications."
        ),
        inputSchema={
            "type": "object",
            "required": ["body"],
            "properties": {
                "subject": {"type": "string", "description": "Email subject or message title"},
                "body": {"type": "string", "description": "Full message body / communication text"},
                "sender": {"type": "string", "description": "Sender email or name"},
                "source_type": {"type": "string", "enum": ["manual", "outlook", "gmail", "teams", "slack", "upload"], "default": "manual"},
                "matter_id": {"type": "string", "description": "Pre-assign to a specific matter (optional — AI will auto-link if omitted)"},
                "recipients": {"type": "array", "items": {"type": "string"}},
            },
        },
    ),
    Tool(
        name="classify_communication",
        description=(
            "Classify a communication's legal category and urgency using AI. "
            "Returns: category (contract_review/litigation/employment/etc.), urgency (low/medium/high/critical), "
            "recommended owner, and next action. Does NOT store anything."
        ),
        inputSchema={
            "type": "object",
            "required": ["body"],
            "properties": {
                "subject": {"type": "string"},
                "body": {"type": "string"},
                "sender": {"type": "string"},
            },
        },
    ),
    Tool(
        name="summarize_communication",
        description=(
            "Produce a structured AI summary of a communication: "
            "2-3 sentence summary, key confirmed facts, open questions, legal issues flagged, action items. "
            "Does NOT store anything."
        ),
        inputSchema={
            "type": "object",
            "required": ["body"],
            "properties": {
                "subject": {"type": "string"},
                "body": {"type": "string"},
                "sender": {"type": "string"},
                "context": {"type": "string", "description": "Optional matter context to improve accuracy"},
            },
        },
    ),
    Tool(
        name="extract_entities",
        description=(
            "Extract all structured legal entities from communication text: "
            "dates, deadlines (with source quotes), tasks (with assignees), parties, documents, "
            "legal triggers, hearings, filings. Does NOT store anything."
        ),
        inputSchema={
            "type": "object",
            "required": ["body"],
            "properties": {
                "subject": {"type": "string"},
                "body": {"type": "string"},
                "matter_context": {"type": "string", "description": "Optional context about the matter"},
            },
        },
    ),

    # ── Timeline ───────────────────────────────────────────────────────────
    Tool(
        name="get_matter_timeline",
        description="Get the complete source-linked chronological timeline of events for a matter.",
        inputSchema={
            "type": "object",
            "required": ["matter_id"],
            "properties": {
                "matter_id": {"type": "string"},
                "event_type": {"type": "string", "description": "Filter by type: communication/deadline/filing/hearing/contract_signed/breach_notice/etc."},
            },
        },
    ),
    Tool(
        name="add_timeline_event",
        description="Manually add a timeline event to a matter (e.g. a hearing, filing, or key date).",
        inputSchema={
            "type": "object",
            "required": ["matter_id", "event_date", "event_type", "title"],
            "properties": {
                "matter_id": {"type": "string"},
                "event_date": {"type": "string", "description": "ISO date string (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)"},
                "event_type": {"type": "string", "enum": ["communication", "deadline", "filing", "hearing", "contract_signed", "breach_notice", "client_contact", "document_received", "trigger_event", "other"]},
                "title": {"type": "string"},
                "summary": {"type": "string"},
            },
        },
    ),

    # ── Tasks & Deadlines ──────────────────────────────────────────────────
    Tool(
        name="list_tasks",
        description="List tasks with optional filters. Returns tasks sorted by priority then due date.",
        inputSchema={
            "type": "object",
            "properties": {
                "matter_id": {"type": "string"},
                "status": {"type": "string", "enum": ["pending", "in_progress", "completed", "cancelled"]},
                "assigned_to": {"type": "string"},
                "priority": {"type": "string", "enum": ["critical", "high", "medium", "low"]},
                "limit": {"type": "integer", "default": 20},
            },
        },
    ),
    Tool(
        name="create_task",
        description="Create a new task on a matter.",
        inputSchema={
            "type": "object",
            "required": ["matter_id", "title"],
            "properties": {
                "matter_id": {"type": "string"},
                "title": {"type": "string"},
                "description": {"type": "string"},
                "assigned_to": {"type": "string"},
                "priority": {"type": "string", "enum": ["critical", "high", "medium", "low"], "default": "medium"},
                "due_date": {"type": "string", "description": "ISO date string"},
            },
        },
    ),
    Tool(
        name="list_deadlines",
        description="List deadlines. Suggested deadlines (AI-extracted, not yet confirmed) are flagged.",
        inputSchema={
            "type": "object",
            "properties": {
                "matter_id": {"type": "string"},
                "status": {"type": "string", "enum": ["suggested", "confirmed", "dismissed", "completed", "overdue"]},
                "upcoming_days": {"type": "integer", "description": "Only return deadlines within N days"},
            },
        },
    ),
    Tool(
        name="confirm_deadline",
        description=(
            "Confirm an AI-extracted deadline (moves it from 'suggested' to 'confirmed'). "
            "Approval-first: all AI-extracted deadlines start as suggested and require human confirmation."
        ),
        inputSchema={
            "type": "object",
            "required": ["deadline_id"],
            "properties": {
                "deadline_id": {"type": "string"},
                "confirmed_by": {"type": "string", "default": "user"},
            },
        },
    ),

    # ── Knowledge Q&A ──────────────────────────────────────────────────────
    Tool(
        name="query_legal_knowledge",
        description=(
            "Grounded legal Q&A against approved internal knowledge sources (playbooks, policies, templates). "
            "Returns an answer with numbered citations and source excerpts. "
            "ONLY uses what's in approved sources — never fabricates. "
            "If sources are insufficient, clearly says so."
        ),
        inputSchema={
            "type": "object",
            "required": ["query"],
            "properties": {
                "query": {"type": "string", "description": "Natural language legal question"},
                "practice_area": {"type": "string", "description": "Filter sources by practice area (e.g. 'litigation', 'employment')"},
                "matter_id": {"type": "string", "description": "Include matter-specific knowledge if available"},
            },
        },
    ),
    Tool(
        name="list_knowledge_sources",
        description="List approved knowledge sources in the knowledge base (playbooks, policies, templates, prior matters).",
        inputSchema={
            "type": "object",
            "properties": {
                "practice_area": {"type": "string"},
                "source_type": {"type": "string", "enum": ["playbook", "policy", "template", "uploaded", "prior_matter", "sharepoint", "google_drive", "manual"]},
            },
        },
    ),

    # ── Audit ──────────────────────────────────────────────────────────────
    Tool(
        name="get_audit_trail",
        description="Get the audit trail of system events — ingestion, AI model calls, approvals, triage actions.",
        inputSchema={
            "type": "object",
            "properties": {
                "matter_id": {"type": "string", "description": "Filter by matter"},
                "event_type": {"type": "string", "description": "Filter by event type (intake_submitted, deadline_confirmed, knowledge_query, etc.)"},
                "limit": {"type": "integer", "default": 30, "maximum": 200},
            },
        },
    ),
]


# ─── Tool Handlers ────────────────────────────────────────────────────────────

@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    return TOOLS


@server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[TextContent]:
    args = arguments or {}
    db = SessionLocal()
    try:
        return await _dispatch(name, args, db)
    except Exception as e:
        return _err(f"Tool '{name}' failed: {str(e)}")
    finally:
        db.close()


async def _dispatch(name: str, args: dict, db) -> list[TextContent]:

    # ── list_matters ──────────────────────────────────────────────────────
    if name == "list_matters":
        query = db.query(Matter)
        if args.get("status"):
            query = query.filter(Matter.status == args["status"])
        if args.get("matter_type"):
            query = query.filter(Matter.matter_type == args["matter_type"])
        if args.get("search"):
            query = query.filter(Matter.title.ilike(f"%{args['search']}%"))
        matters = query.order_by(Matter.updated_at.desc()).limit(args.get("limit", 20)).all()

        result = []
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
            result.append({
                "id": m.id,
                "title": m.title,
                "matter_number": m.matter_number,
                "status": m.status,
                "matter_type": m.matter_type,
                "assigned_to": m.assigned_to,
                "client": m.client.name if m.client else None,
                "open_tasks": open_tasks,
                "upcoming_deadlines": upcoming_deadlines,
                "tags": m.tags or [],
                "created_at": m.created_at,
            })
        return _json({"matters": result, "count": len(result)})

    # ── get_matter ────────────────────────────────────────────────────────
    if name == "get_matter":
        matter_id = args["matter_id"]
        m = db.query(Matter).filter(Matter.id == matter_id).first()
        if not m:
            return _err(f"Matter {matter_id} not found")

        total_comms = db.query(Communication).filter(Communication.matter_id == matter_id).count()
        open_tasks = db.query(Task).filter(Task.matter_id == matter_id, Task.status.in_(["pending", "in_progress"])).count()
        upcoming_deadlines = db.query(Deadline).filter(
            Deadline.matter_id == matter_id,
            Deadline.status.in_(["suggested", "confirmed"]),
            Deadline.deadline_date >= datetime.utcnow()
        ).count()
        recent_comms = db.query(Communication).filter(
            Communication.matter_id == matter_id
        ).order_by(Communication.received_at.desc()).limit(5).all()

        return _json({
            "id": m.id,
            "title": m.title,
            "matter_number": m.matter_number,
            "status": m.status,
            "matter_type": m.matter_type,
            "description": m.description,
            "assigned_to": m.assigned_to,
            "client": {"id": m.client.id, "name": m.client.name, "email": m.client.email} if m.client else None,
            "tags": m.tags or [],
            "stats": {
                "total_communications": total_comms,
                "open_tasks": open_tasks,
                "upcoming_deadlines": upcoming_deadlines,
            },
            "recent_communications": [
                {"id": c.id, "subject": c.subject, "sender": c.sender, "urgency": c.urgency,
                 "category": c.category, "received_at": c.received_at, "summary": c.summary}
                for c in recent_comms
            ],
            "created_at": m.created_at,
            "updated_at": m.updated_at,
        })

    # ── create_matter ─────────────────────────────────────────────────────
    if name == "create_matter":
        client_id = None
        if args.get("client_name"):
            client = Client(id=str(uuid.uuid4()), name=args["client_name"])
            db.add(client)
            db.flush()
            client_id = client.id

        count = db.query(Matter).count() + 1
        matter = Matter(
            id=str(uuid.uuid4()),
            title=args["title"],
            matter_number=f"M-{datetime.utcnow().year}-{count:04d}",
            matter_type=args.get("matter_type", "general"),
            description=args.get("description"),
            assigned_to=args.get("assigned_to"),
            client_id=client_id,
            status=MatterStatus.OPEN,
        )
        db.add(matter)
        db.commit()
        AuditService(db).log("matter_created", "matter", matter.id, matter.id, action="create",
                             details={"source": "mcp"})
        return _json({"created": True, "matter_id": matter.id, "matter_number": matter.matter_number,
                      "title": matter.title, "status": "open"})

    # ── process_intake ────────────────────────────────────────────────────
    if name == "process_intake":
        service = IngestionService(db)
        data = {
            "subject": args.get("subject", ""),
            "body": args.get("body", ""),
            "sender": args.get("sender", ""),
            "source_type": args.get("source_type", "manual"),
            "matter_id": args.get("matter_id"),
            "recipients": args.get("recipients", []),
        }
        comm = service.process_communication(data)
        AuditService(db).log(
            "intake_submitted", "communication", comm.id, comm.matter_id,
            action="intake", details={"source": "mcp", "source_type": data["source_type"]},
            ai_model_used=llm_client.active_model() if llm_client.has_llm() else None
        )
        return _json({
            "communication_id": comm.id,
            "matter_id": comm.matter_id,
            "category": comm.category,
            "urgency": comm.urgency,
            "summary": comm.summary,
            "key_facts": comm.key_facts or [],
            "action_items": comm.action_items or [],
            "legal_issues": comm.legal_issues or [],
            "open_questions": comm.open_questions or [],
            "owner_recommendation": comm.owner_recommendation,
            "next_action": comm.next_action,
            "extracted_entities": comm.extracted_entities or {},
            "is_processed": comm.is_processed,
            "ai_enabled": llm_client.has_llm(),
            "ai_model": llm_client.active_model() if llm_client.has_llm() else None,
        })

    # ── classify_communication ────────────────────────────────────────────
    if name == "classify_communication":
        if not llm_client.has_llm():
            return _err("No LLM API key configured. Set ANTHROPIC_API_KEY or GEMINI_API_KEY in backend/.env to enable AI classification.")
        classifier = IntakeClassifier()
        result = classifier.classify(
            subject=args.get("subject", ""),
            body=args.get("body", ""),
            sender=args.get("sender", "")
        )
        return _json(result)

    # ── summarize_communication ───────────────────────────────────────────
    if name == "summarize_communication":
        if not llm_client.has_llm():
            return _err("No LLM API key configured. Set ANTHROPIC_API_KEY or GEMINI_API_KEY in backend/.env to enable AI summarization.")
        summarizer = CommunicationSummarizer()
        result = summarizer.summarize(
            subject=args.get("subject", ""),
            body=args.get("body", ""),
            sender=args.get("sender", ""),
            context=args.get("context", "")
        )
        return _json(result)

    # ── extract_entities ──────────────────────────────────────────────────
    if name == "extract_entities":
        if not llm_client.has_llm():
            return _err("No LLM API key configured. Set ANTHROPIC_API_KEY or GEMINI_API_KEY in backend/.env to enable entity extraction.")
        extractor = EntityExtractor()
        result = extractor.extract(
            subject=args.get("subject", ""),
            body=args.get("body", ""),
            matter_context=args.get("matter_context", "")
        )
        return _json(result)

    # ── get_matter_timeline ───────────────────────────────────────────────
    if name == "get_matter_timeline":
        matter_id = args["matter_id"]
        m = db.query(Matter).filter(Matter.id == matter_id).first()
        if not m:
            return _err(f"Matter {matter_id} not found")

        query = db.query(TimelineEvent).filter(TimelineEvent.matter_id == matter_id)
        if args.get("event_type"):
            query = query.filter(TimelineEvent.event_type == args["event_type"])
        events = query.order_by(TimelineEvent.event_date.asc()).all()

        return _json({
            "matter_id": matter_id,
            "matter_title": m.title,
            "total_events": len(events),
            "events": [
                {
                    "id": e.id,
                    "event_date": e.event_date,
                    "event_type": e.event_type,
                    "title": e.title,
                    "summary": e.summary,
                    "associated_contacts": e.associated_contacts or [],
                    "source_references": e.source_references or [],
                    "is_confirmed": e.is_confirmed,
                }
                for e in events
            ],
        })

    # ── add_timeline_event ────────────────────────────────────────────────
    if name == "add_timeline_event":
        matter_id = args["matter_id"]
        m = db.query(Matter).filter(Matter.id == matter_id).first()
        if not m:
            return _err(f"Matter {matter_id} not found")

        event_type_enum = EventType.OTHER
        try:
            event_type_enum = EventType(args["event_type"])
        except ValueError:
            pass

        from datetime import datetime as dt
        event_date = dt.utcnow()
        try:
            ds = args["event_date"]
            for fmt in ["%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%SZ"]:
                try:
                    event_date = dt.strptime(ds[:19], fmt[:len(ds)])
                    break
                except Exception:
                    continue
        except Exception:
            pass

        event = TimelineEvent(
            id=str(uuid.uuid4()),
            matter_id=matter_id,
            event_date=event_date,
            event_type=event_type_enum,
            title=args["title"],
            summary=args.get("summary", ""),
            is_confirmed="true",
            extracted_from="mcp_manual",
        )
        db.add(event)
        db.commit()
        return _json({"created": True, "event_id": event.id, "matter_id": matter_id,
                      "title": event.title, "event_date": event.event_date})

    # ── list_tasks ────────────────────────────────────────────────────────
    if name == "list_tasks":
        query = db.query(Task)
        if args.get("matter_id"):
            query = query.filter(Task.matter_id == args["matter_id"])
        if args.get("status"):
            query = query.filter(Task.status == args["status"])
        if args.get("assigned_to"):
            query = query.filter(Task.assigned_to == args["assigned_to"])
        if args.get("priority"):
            query = query.filter(Task.priority == args["priority"])

        tasks = query.order_by(Task.due_date.asc().nullslast()).limit(args.get("limit", 20)).all()

        return _json({
            "tasks": [
                {
                    "id": t.id,
                    "matter_id": t.matter_id,
                    "title": t.title,
                    "description": t.description,
                    "assigned_to": t.assigned_to,
                    "status": t.status,
                    "priority": t.priority,
                    "due_date": t.due_date,
                    "completed_at": t.completed_at,
                    "source_snippet": t.source_snippet,
                }
                for t in tasks
            ],
            "count": len(tasks),
        })

    # ── create_task ───────────────────────────────────────────────────────
    if name == "create_task":
        matter_id = args["matter_id"]
        m = db.query(Matter).filter(Matter.id == matter_id).first()
        if not m:
            return _err(f"Matter {matter_id} not found")

        due_date = None
        if args.get("due_date"):
            try:
                from datetime import datetime as dt
                for fmt in ["%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"]:
                    try:
                        due_date = dt.strptime(args["due_date"][:10], "%Y-%m-%d")
                        break
                    except Exception:
                        continue
            except Exception:
                pass

        priority_map = {"critical": TaskPriority.CRITICAL, "high": TaskPriority.HIGH,
                        "medium": TaskPriority.MEDIUM, "low": TaskPriority.LOW}
        task = Task(
            id=str(uuid.uuid4()),
            matter_id=matter_id,
            title=args["title"],
            description=args.get("description"),
            assigned_to=args.get("assigned_to"),
            priority=priority_map.get(args.get("priority", "medium"), TaskPriority.MEDIUM),
            due_date=due_date,
            status=TaskStatus.PENDING,
        )
        db.add(task)
        db.commit()
        AuditService(db).log("task_created", "task", task.id, matter_id, action="create",
                             details={"source": "mcp"})
        return _json({"created": True, "task_id": task.id, "title": task.title,
                      "matter_id": matter_id, "priority": task.priority, "status": "pending"})

    # ── list_deadlines ────────────────────────────────────────────────────
    if name == "list_deadlines":
        query = db.query(Deadline)
        if args.get("matter_id"):
            query = query.filter(Deadline.matter_id == args["matter_id"])
        if args.get("status"):
            query = query.filter(Deadline.status == args["status"])
        if args.get("upcoming_days"):
            from datetime import timedelta
            cutoff = datetime.utcnow()
            query = query.filter(
                Deadline.deadline_date >= cutoff,
                Deadline.deadline_date <= cutoff + timedelta(days=args["upcoming_days"])
            )

        deadlines = query.order_by(Deadline.deadline_date.asc()).all()

        return _json({
            "deadlines": [
                {
                    "id": d.id,
                    "matter_id": d.matter_id,
                    "title": d.title,
                    "deadline_date": d.deadline_date,
                    "status": d.status,
                    "deadline_type": d.deadline_type,
                    "source_snippet": d.source_snippet,
                    "confirmed_by": d.confirmed_by,
                    "confirmed_at": d.confirmed_at,
                    "requires_confirmation": d.status == DeadlineStatus.SUGGESTED,
                }
                for d in deadlines
            ],
            "count": len(deadlines),
            "suggested_count": sum(1 for d in deadlines if d.status == DeadlineStatus.SUGGESTED),
        })

    # ── confirm_deadline ──────────────────────────────────────────────────
    if name == "confirm_deadline":
        deadline_id = args["deadline_id"]
        d = db.query(Deadline).filter(Deadline.id == deadline_id).first()
        if not d:
            return _err(f"Deadline {deadline_id} not found")
        if d.status == DeadlineStatus.CONFIRMED:
            return _json({"status": "already_confirmed", "deadline_id": deadline_id})

        d.status = DeadlineStatus.CONFIRMED
        d.confirmed_by = args.get("confirmed_by", "mcp_user")
        d.confirmed_at = datetime.utcnow()
        db.commit()
        AuditService(db).log("deadline_confirmed", "deadline", deadline_id, d.matter_id,
                             action="confirm", details={"confirmed_by": d.confirmed_by, "source": "mcp"})
        return _json({"confirmed": True, "deadline_id": deadline_id, "title": d.title,
                      "deadline_date": d.deadline_date, "confirmed_by": d.confirmed_by})

    # ── query_legal_knowledge ─────────────────────────────────────────────
    if name == "query_legal_knowledge":
        query_db = db.query(KnowledgeItem).filter(KnowledgeItem.is_approved == "true")
        if args.get("practice_area"):
            query_db = query_db.filter(KnowledgeItem.practice_area == args["practice_area"])
        if args.get("matter_id"):
            from sqlalchemy import or_
            query_db = query_db.filter(
                or_(KnowledgeItem.matter_id == args["matter_id"], KnowledgeItem.matter_id == None)
            )

        all_items = query_db.all()
        if not all_items:
            return _json({
                "query": args["query"],
                "answer": "No approved knowledge sources available. Add sources via the web app or API.",
                "citations": [],
                "is_complete": False,
                "ai_enabled": bool(settings.anthropic_api_key),
            })

        items_dicts = [
            {"id": item.id, "title": item.title, "source_type": item.source_type,
             "source_url": item.source_url, "content": item.content,
             "content_summary": item.content_summary, "tags": item.tags or []}
            for item in all_items
        ]

        qa = LegalKnowledgeQA()
        relevant = qa.find_relevant_sources(args["query"], items_dicts)

        if not llm_client.has_llm():
            return _json({
                "query": args["query"],
                "answer": "AI not available (no ANTHROPIC_API_KEY or GEMINI_API_KEY set). Found relevant sources:",
                "relevant_sources": [{"title": i["title"], "source_type": i["source_type"]} for i in relevant[:5]],
                "is_complete": False,
                "ai_enabled": False,
            })

        result = qa.answer(args["query"], relevant[:5])
        AuditService(db).log(
            "knowledge_query", "knowledge", None, args.get("matter_id"),
            action="query", details={"query": args["query"][:200], "source": "mcp"},
            ai_model_used=result.get("model_used"),
        )
        return _json({
            "query": args["query"],
            "answer": result["answer"],
            "citations": result["citations"],
            "is_complete": result["is_complete"],
            "uncertainty_notes": result.get("uncertainty_notes"),
            "sources_searched": len(all_items),
            "sources_used": len(relevant),
        })

    # ── list_knowledge_sources ────────────────────────────────────────────
    if name == "list_knowledge_sources":
        query = db.query(KnowledgeItem)
        if args.get("practice_area"):
            query = query.filter(KnowledgeItem.practice_area == args["practice_area"])
        if args.get("source_type"):
            query = query.filter(KnowledgeItem.source_type == args["source_type"])
        items = query.order_by(KnowledgeItem.title).all()
        return _json({
            "knowledge_sources": [
                {
                    "id": i.id,
                    "title": i.title,
                    "source_type": i.source_type,
                    "practice_area": i.practice_area,
                    "tags": i.tags or [],
                    "is_approved": i.is_approved,
                    "source_url": i.source_url,
                    "has_content": bool(i.content),
                }
                for i in items
            ],
            "count": len(items),
            "approved_count": sum(1 for i in items if i.is_approved == "true"),
        })

    # ── get_audit_trail ───────────────────────────────────────────────────
    if name == "get_audit_trail":
        query = db.query(AuditLog)
        if args.get("matter_id"):
            query = query.filter(AuditLog.matter_id == args["matter_id"])
        if args.get("event_type"):
            query = query.filter(AuditLog.event_type == args["event_type"])
        logs = query.order_by(AuditLog.created_at.desc()).limit(args.get("limit", 30)).all()
        return _json({
            "audit_entries": [
                {
                    "id": log.id,
                    "event_type": log.event_type,
                    "entity_type": log.entity_type,
                    "entity_id": log.entity_id,
                    "matter_id": log.matter_id,
                    "action": log.action,
                    "ai_model_used": log.ai_model_used,
                    "details": log.details,
                    "created_at": log.created_at,
                }
                for log in logs
            ],
            "count": len(logs),
        })

    return _err(f"Unknown tool: {name}")


# ─── Entry Point ──────────────────────────────────────────────────────────────

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )


if __name__ == "__main__":
    asyncio.run(main())
