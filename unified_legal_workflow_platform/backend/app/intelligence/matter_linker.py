import json
from . import llm_client


SYSTEM_PROMPT = """You are a legal matter routing specialist. Given a new communication and a list of existing matters, determine if the communication belongs to an existing matter or should start a new one.

Return valid JSON only. Be conservative — only link to an existing matter if there is strong evidence of connection."""


class MatterLinker:
    def link(self, subject: str, body: str, sender: str, existing_matters: list) -> dict:
        matters_text = "\n".join([
            f"- ID: {m['id']}, Title: {m['title']}, Client: {m.get('client', 'unknown')}, Type: {m.get('type', 'general')}"
            for m in existing_matters[:20]
        ]) if existing_matters else "No existing matters."

        prompt = f"""Communication to route:
Subject: {subject or '(no subject)'}
From: {sender or 'unknown'}
Body: {body[:2000]}

Existing matters:
{matters_text}

Return JSON:
{{
  "linked_matter_id": "matter ID if matched, or null",
  "confidence": 0.0-1.0,
  "reason": "explanation of the match or why no match",
  "suggested_matter_title": "if no match, suggested new matter title",
  "suggested_matter_type": "litigation|corporate|employment|ip|real_estate|regulatory|general"
}}"""

        raw = llm_client.complete(SYSTEM_PROMPT, prompt, max_tokens=512)
        raw = llm_client.strip_fences(raw)
        result = json.loads(raw)
        return {
            "linked_matter_id": result.get("linked_matter_id"),
            "confidence": float(result.get("confidence", 0.0)),
            "reason": result.get("reason", ""),
            "suggested_matter_title": result.get("suggested_matter_title", ""),
            "suggested_matter_type": result.get("suggested_matter_type", "general"),
        }
