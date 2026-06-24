import json
from . import llm_client
from ..models.communication import LegalCategory, UrgencyLevel


SYSTEM_PROMPT = """You are a legal intake classification specialist. Analyze incoming legal communications and classify them accurately.

Your task is to:
1. Identify the legal category of the request
2. Assess urgency level
3. Recommend who should own it
4. Suggest the next recommended action

Always return valid JSON matching the exact schema provided. Be conservative with urgency - only mark CRITICAL for genuine emergencies with immediate legal consequences."""

CLASSIFICATION_SCHEMA = {
    "category": "one of: contract_review, litigation_support, privacy_data, employment, commercial_dispute, compliance, policy_question, general_inquiry, unclassified",
    "urgency": "one of: low, medium, high, critical",
    "owner_recommendation": "suggested role or team (e.g., 'Senior Litigation Partner', 'Employment Counsel', 'Privacy Team')",
    "next_action": "specific recommended next step",
    "reasoning": "brief explanation of the classification",
    "confidence": "float 0.0-1.0"
}


class IntakeClassifier:
    def classify(self, subject: str, body: str, sender: str = "") -> dict:
        prompt = f"""Classify this legal communication:

Subject: {subject or '(no subject)'}
From: {sender or 'unknown'}
Body:
{body[:3000]}

Return JSON matching this schema:
{json.dumps(CLASSIFICATION_SCHEMA, indent=2)}"""

        raw = llm_client.complete(SYSTEM_PROMPT, prompt, max_tokens=1024)
        raw = llm_client.strip_fences(raw)
        result = json.loads(raw)

        cat = result.get("category", "unclassified").lower().replace(" ", "_")
        if cat not in [e.value for e in LegalCategory]:
            cat = "unclassified"

        urg = result.get("urgency", "low").lower()
        if urg not in [e.value for e in UrgencyLevel]:
            urg = "medium"

        return {
            "category": cat,
            "urgency": urg,
            "owner_recommendation": result.get("owner_recommendation", ""),
            "next_action": result.get("next_action", ""),
            "reasoning": result.get("reasoning", ""),
            "confidence": float(result.get("confidence", 0.7)),
        }
