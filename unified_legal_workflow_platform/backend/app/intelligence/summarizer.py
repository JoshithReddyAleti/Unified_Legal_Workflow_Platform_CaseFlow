import json
from . import llm_client


SYSTEM_PROMPT = """You are a legal communication analyst. Produce structured, accurate summaries of legal communications.

Rules:
- Distinguish clearly between CONFIRMED FACTS (stated explicitly) and INFERRED ISSUES (implied or suggested)
- Always cite the source of each fact (e.g., "per email body", "per attached contract")
- Identify unknowns and missing documents
- Be precise with legal terminology
- Do not speculate beyond what the source material supports
- Return valid JSON only"""


class CommunicationSummarizer:
    def summarize(self, subject: str, body: str, sender: str = "", context: str = "") -> dict:
        prompt = f"""Summarize this legal communication:

Subject: {subject or '(no subject)'}
From: {sender or 'unknown'}
{f'Context: {context}' if context else ''}
Body:
{body[:4000]}

Return JSON with this exact structure:
{{
  "summary": "2-3 sentence concise summary",
  "key_facts": [
    {{"fact": "...", "source": "email body|attachment|subject", "is_confirmed": true}}
  ],
  "open_questions": ["list of unanswered questions"],
  "legal_issues": [
    {{"issue": "...", "is_inferred": true, "confidence": 0.8}}
  ],
  "action_items": [
    {{"action": "...", "assignee": "...", "urgency": "low|medium|high"}}
  ],
  "unresolved_requests": ["list of unresolved items"],
  "missing_documents": ["list of referenced but missing docs"]
}}"""

        raw = llm_client.complete(SYSTEM_PROMPT, prompt, max_tokens=2048)
        raw = llm_client.strip_fences(raw)
        result = json.loads(raw)
        return {
            "summary": result.get("summary", ""),
            "key_facts": result.get("key_facts", []),
            "open_questions": result.get("open_questions", []),
            "legal_issues": result.get("legal_issues", []),
            "action_items": result.get("action_items", []),
            "unresolved_requests": result.get("unresolved_requests", []),
            "missing_documents": result.get("missing_documents", []),
        }
