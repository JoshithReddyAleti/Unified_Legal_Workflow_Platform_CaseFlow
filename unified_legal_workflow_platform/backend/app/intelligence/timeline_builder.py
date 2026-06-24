import json
from . import llm_client


SYSTEM_PROMPT = """You are a legal timeline specialist. Given a set of communications and extracted events, build a structured, chronological timeline of matter events.

Rules:
- Only include events that are explicitly referenced in the communications
- Each event must have a source reference
- Sort events chronologically
- Use consistent event types
- Return valid JSON only"""


class TimelineBuilder:
    def build_events_from_communication(self, subject: str, body: str, sender: str,
                                         received_at: str, comm_id: str, matter_title: str = "") -> list:
        prompt = f"""Extract timeline events from this communication for matter: {matter_title}

Communication ID: {comm_id}
Received: {received_at}
Subject: {subject or '(no subject)'}
From: {sender or 'unknown'}
Body:
{body[:3000]}

Return JSON array of timeline events:
[
  {{
    "event_date": "YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS",
    "event_type": "communication|deadline|filing|hearing|contract_signed|breach_notice|client_contact|document_received|trigger_event|other",
    "title": "concise event title",
    "summary": "1-2 sentence description",
    "source_references": [{{"type": "email|slack|teams|document", "id": "{comm_id}", "description": "brief source note"}}],
    "linked_documents": ["document names mentioned"],
    "associated_contacts": ["party names involved in this event"],
    "is_confirmed": "true"
  }}
]

Only return events that are directly evidenced in the communication. Minimum 1 event (the communication itself), maximum 10."""

        raw = llm_client.complete(SYSTEM_PROMPT, prompt, max_tokens=2000)
        raw = llm_client.strip_fences(raw)
        events = json.loads(raw)
        if not isinstance(events, list):
            events = [events]
        return events
