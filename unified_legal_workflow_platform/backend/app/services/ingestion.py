import json
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.communication import Communication, SourceType, LegalCategory, UrgencyLevel
from ..models.task import Task, Deadline, TaskPriority, TaskStatus, DeadlineStatus
from ..models.timeline import TimelineEvent, EventType
from ..models.matter import Matter, MatterType
from ..intelligence.intake_classifier import IntakeClassifier
from ..intelligence.summarizer import CommunicationSummarizer
from ..intelligence.extractor import EntityExtractor
from ..intelligence.matter_linker import MatterLinker
from ..intelligence.timeline_builder import TimelineBuilder
from ..intelligence import llm_client


class IngestionService:
    def __init__(self, db: Session):
        self.db = db
        self.use_ai = llm_client.has_llm()
        if self.use_ai:
            self.classifier = IntakeClassifier()
            self.summarizer = CommunicationSummarizer()
            self.extractor = EntityExtractor()
            self.linker = MatterLinker()
            self.timeline_builder = TimelineBuilder()

    def process_communication(self, data: dict) -> Communication:
        comm = Communication(
            source_type=data.get("source_type", SourceType.MANUAL),
            source_id=data.get("source_id"),
            source_url=data.get("source_url"),
            subject=data.get("subject", ""),
            body=data.get("body", ""),
            sender=data.get("sender", ""),
            recipients=data.get("recipients", []),
            received_at=data.get("received_at") or datetime.utcnow(),
            thread_id=data.get("thread_id"),
            matter_id=data.get("matter_id"),
        )

        if self.use_ai:
            self._run_intelligence_pipeline(comm, data)
        else:
            self._apply_demo_defaults(comm)

        self.db.add(comm)
        self.db.flush()

        # Create tasks/deadlines/timeline events from extracted data
        if comm.extracted_entities:
            self._create_artifacts(comm)

        self.db.commit()
        return comm

    def _run_intelligence_pipeline(self, comm: Communication, data: dict):
        subject = comm.subject or ""
        body = comm.body or ""
        sender = comm.sender or ""

        # 1. Classify
        try:
            classification = self.classifier.classify(subject, body, sender)
            comm.category = classification["category"]
            comm.urgency = classification["urgency"]
            comm.owner_recommendation = classification["owner_recommendation"]
            comm.next_action = classification["next_action"]
        except Exception:
            comm.category = LegalCategory.UNCLASSIFIED
            comm.urgency = UrgencyLevel.MEDIUM

        # 2. Matter linking (if not already assigned)
        if not comm.matter_id:
            try:
                matters = self.db.query(Matter).filter(
                    Matter.status.in_(["open", "active"])
                ).limit(20).all()
                matter_list = [{"id": m.id, "title": m.title, "type": m.matter_type} for m in matters]
                link = self.linker.link(subject, body, sender, matter_list)
                if link["linked_matter_id"] and link["confidence"] >= 0.7:
                    comm.matter_id = link["linked_matter_id"]
            except Exception:
                pass

        # 3. Summarize
        try:
            summary_result = self.summarizer.summarize(subject, body, sender)
            comm.summary = summary_result["summary"]
            comm.key_facts = [f["fact"] if isinstance(f, dict) else f for f in summary_result.get("key_facts", [])]
            comm.open_questions = summary_result.get("open_questions", [])
            comm.legal_issues = [i["issue"] if isinstance(i, dict) else i for i in summary_result.get("legal_issues", [])]
            comm.action_items = [a["action"] if isinstance(a, dict) else a for a in summary_result.get("action_items", [])]
        except Exception:
            comm.summary = f"Communication from {sender}: {subject}"

        # 4. Extract entities
        try:
            entities = self.extractor.extract(subject, body)
            comm.extracted_entities = entities
        except Exception:
            comm.extracted_entities = {}

        comm.is_processed = True

    def _apply_demo_defaults(self, comm: Communication):
        comm.category = LegalCategory.GENERAL_INQUIRY
        comm.urgency = UrgencyLevel.MEDIUM
        comm.summary = f"Communication: {comm.subject or '(no subject)'}"
        comm.key_facts = []
        comm.open_questions = []
        comm.legal_issues = []
        comm.action_items = []
        comm.extracted_entities = {}
        comm.is_processed = True

    def _create_artifacts(self, comm: Communication):
        entities = comm.extracted_entities or {}
        matter_id = comm.matter_id
        if not matter_id:
            return

        # Create deadlines from extracted deadlines
        for dl in entities.get("deadlines", []):
            try:
                deadline_date = self._parse_date(dl.get("date"))
                if deadline_date:
                    deadline = Deadline(
                        matter_id=matter_id,
                        communication_id=comm.id,
                        title=dl.get("description", "Deadline"),
                        deadline_date=deadline_date,
                        deadline_type=dl.get("deadline_type", "other"),
                        source_snippet=dl.get("source_text", ""),
                        status=DeadlineStatus.SUGGESTED,
                    )
                    self.db.add(deadline)
            except Exception:
                pass

        # Create tasks from extracted tasks
        for task_data in entities.get("tasks", []):
            try:
                task = Task(
                    matter_id=matter_id,
                    communication_id=comm.id,
                    title=task_data.get("description", "Task"),
                    assigned_to=task_data.get("assignee", ""),
                    due_date=self._parse_date(task_data.get("due_date")),
                    source_snippet=task_data.get("source_text", ""),
                    status=TaskStatus.PENDING,
                    priority=TaskPriority.MEDIUM,
                )
                self.db.add(task)
            except Exception:
                pass

        # Create timeline events
        try:
            received_str = comm.received_at.isoformat() if comm.received_at else datetime.utcnow().isoformat()
            matter = self.db.query(Matter).filter(Matter.id == matter_id).first()
            matter_title = matter.title if matter else ""

            if self.use_ai:
                events = self.timeline_builder.build_events_from_communication(
                    comm.subject or "", comm.body or "", comm.sender or "",
                    received_str, comm.id, matter_title
                )
            else:
                events = [{
                    "event_date": received_str,
                    "event_type": "communication",
                    "title": comm.subject or "Communication received",
                    "summary": comm.summary or "",
                    "source_references": [{"type": comm.source_type, "id": comm.id}],
                    "linked_documents": [],
                    "associated_contacts": [comm.sender] if comm.sender else [],
                    "is_confirmed": "true",
                }]

            for event_data in events:
                event_date = self._parse_date(event_data.get("event_date"))
                if not event_date:
                    event_date = comm.received_at or datetime.utcnow()

                event_type_str = event_data.get("event_type", "other")
                event_type = self._normalize_event_type(event_type_str)

                event = TimelineEvent(
                    matter_id=matter_id,
                    communication_id=comm.id,
                    event_date=event_date,
                    event_type=event_type,
                    title=event_data.get("title", "Event"),
                    summary=event_data.get("summary", ""),
                    source_references=event_data.get("source_references", []),
                    linked_documents=event_data.get("linked_documents", []),
                    associated_contacts=event_data.get("associated_contacts", []),
                    is_confirmed=event_data.get("is_confirmed", "false"),
                    extracted_from=comm.source_type,
                )
                self.db.add(event)
        except Exception:
            pass

    def _parse_date(self, date_str: str):
        if not date_str:
            return None
        from datetime import datetime
        formats = [
            "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%SZ",
            "%Y-%m-%dT%H:%M:%S.%f", "%m/%d/%Y", "%d/%m/%Y"
        ]
        for fmt in formats:
            try:
                return datetime.strptime(date_str[:19], fmt[:len(date_str)])
            except Exception:
                continue
        return None

    def _normalize_event_type(self, event_type_str: str) -> EventType:
        mapping = {
            "communication": EventType.COMMUNICATION,
            "deadline": EventType.DEADLINE,
            "filing": EventType.FILING,
            "hearing": EventType.HEARING,
            "contract_signed": EventType.CONTRACT_SIGNED,
            "breach_notice": EventType.BREACH_NOTICE,
            "client_contact": EventType.CLIENT_CONTACT,
            "document_received": EventType.DOCUMENT_RECEIVED,
            "trigger_event": EventType.TRIGGER_EVENT,
        }
        return mapping.get(event_type_str.lower(), EventType.OTHER)
