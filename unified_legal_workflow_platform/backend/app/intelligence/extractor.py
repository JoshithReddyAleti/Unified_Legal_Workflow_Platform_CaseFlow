import json
from . import llm_client


SYSTEM_PROMPT = """You are a legal entity extraction specialist. Extract structured legal data from communications.

Extract with precision:
- Dates must be in ISO format (YYYY-MM-DD) when possible, otherwise describe as found
- Deadlines must include the triggering text snippet
- Tasks must have clear actionable descriptions
- Only extract what is explicitly stated — do not infer
- Return valid JSON only"""


class EntityExtractor:
    def extract(self, subject: str, body: str, matter_context: str = "") -> dict:
        prompt = f"""Extract all legal entities from this communication:

Subject: {subject or '(no subject)'}
{f'Matter Context: {matter_context}' if matter_context else ''}
Body:
{body[:4000]}

Return JSON with this exact structure:
{{
  "dates": [
    {{"date": "YYYY-MM-DD or description", "context": "brief context of the date", "source_text": "exact quote"}}
  ],
  "deadlines": [
    {{"date": "YYYY-MM-DD", "description": "what is due", "deadline_type": "filing|response|contract|hearing|notice|other", "source_text": "exact quote", "is_explicit": true}}
  ],
  "tasks": [
    {{"description": "clear action item", "assignee": "who should do it or empty", "due_date": "YYYY-MM-DD or null", "source_text": "exact quote"}}
  ],
  "parties": [
    {{"name": "...", "role": "client|counterparty|counsel|witness|judge|other", "organization": "..."}}
  ],
  "documents": [
    {{"name": "document name", "status": "attached|referenced|missing|pending"}}
  ],
  "legal_triggers": [
    {{"trigger": "description of legal trigger event", "date": "YYYY-MM-DD or null", "significance": "..."}}
  ],
  "hearings": [
    {{"date": "YYYY-MM-DD", "court": "...", "type": "...", "source_text": "..."}}
  ],
  "filings": [
    {{"date": "YYYY-MM-DD", "type": "...", "court": "...", "source_text": "..."}}
  ]
}}"""

        raw = llm_client.complete(SYSTEM_PROMPT, prompt, max_tokens=3000)
        raw = llm_client.strip_fences(raw)
        result = json.loads(raw)
        return {
            "dates": result.get("dates", []),
            "deadlines": result.get("deadlines", []),
            "tasks": result.get("tasks", []),
            "parties": result.get("parties", []),
            "documents": result.get("documents", []),
            "legal_triggers": result.get("legal_triggers", []),
            "hearings": result.get("hearings", []),
            "filings": result.get("filings", []),
        }
