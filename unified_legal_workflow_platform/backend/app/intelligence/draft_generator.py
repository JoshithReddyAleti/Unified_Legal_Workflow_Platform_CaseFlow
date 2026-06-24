import json
from . import llm_client


SYSTEM_PROMPT = """You are a legal assistant helping draft a professional reply to an incoming legal communication.
Return valid JSON only. Do NOT make legal commitments, admit liability, or waive rights."""


async def generate_draft_reply(
    original_subject: str,
    original_body: str,
    sender: str,
    category: str,
    summary: str,
    key_facts: list[str],
    tone: str = "professional",
    matter_context: str | None = None,
) -> dict:
    """Generate a draft reply for a communication. Always requires human review."""

    if not llm_client.has_llm():
        return _demo_draft(original_subject, sender)

    context_block = f"\n\nMatter context: {matter_context}" if matter_context else ""
    facts_block = "\n".join(f"- {f}" for f in key_facts[:6]) if key_facts else "None extracted"

    prompt = f"""Original message:
Subject: {original_subject}
From: {sender}
Category: {category}
Body:
{original_body[:2000]}

AI Analysis:
Summary: {summary}
Key facts:
{facts_block}{context_block}

Instructions:
- Draft a professional {tone} reply suitable for a legal context
- Acknowledge receipt and the key points raised
- Do NOT make legal commitments, admit liability, or waive rights
- Do NOT state legal opinions or conclusions
- Keep it concise (3–5 paragraphs maximum)
- Use placeholders like [ATTORNEY NAME], [DATE], [FIRM NAME] where appropriate
- This draft MUST be reviewed and approved by an attorney before sending

Return JSON:
{{
  "subject": "Re: {original_subject}",
  "body": "full draft reply text",
  "tone": "{tone}",
  "warnings": ["list of things the reviewing attorney should check"],
  "suggested_actions": ["list of follow-up actions"]
}}"""

    text = await llm_client.acomplete(SYSTEM_PROMPT, prompt, max_tokens=1500)
    text = llm_client.strip_fences(text)
    try:
        return json.loads(text)
    except Exception:
        return {
            "subject": f"Re: {original_subject}",
            "body": text,
            "tone": tone,
            "warnings": ["Review this AI-generated draft carefully before sending"],
            "suggested_actions": [],
        }


def _demo_draft(subject: str, sender: str) -> dict:
    return {
        "subject": f"Re: {subject}",
        "body": (
            f"Dear {sender.split('@')[0].replace('.', ' ').title()},\n\n"
            "Thank you for your message. We have received your correspondence and are reviewing the matter carefully.\n\n"
            "We will respond with a substantive reply within [X] business days. "
            "If this matter is time-sensitive or involves an upcoming deadline, please contact our office directly at [PHONE NUMBER].\n\n"
            "Please be advised that this response does not constitute a waiver of any rights, defenses, or claims.\n\n"
            "Sincerely,\n[ATTORNEY NAME]\n[FIRM NAME]\n[PHONE] | [EMAIL]"
        ),
        "tone": "professional",
        "warnings": [
            "This is a demo draft — review all placeholders before sending",
            "Confirm any stated deadlines against case records",
            "Ensure no inadvertent admissions or privilege waivers",
        ],
        "suggested_actions": [
            "Review full communication thread before sending",
            "Confirm matter assignment and billing",
        ],
    }
