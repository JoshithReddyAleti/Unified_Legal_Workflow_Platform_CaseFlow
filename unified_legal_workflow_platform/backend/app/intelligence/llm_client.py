"""
LLM abstraction layer — routes to Anthropic (Claude) or Google (Gemini) based on
which API key is configured in .env.  Anthropic takes priority if both keys are set.

Usage in any intelligence module:
    from . import llm_client

    text = llm_client.complete(SYSTEM_PROMPT, user_prompt, max_tokens=1024)
    text = await llm_client.acomplete(SYSTEM_PROMPT, user_prompt, max_tokens=1024)
    json_text = llm_client.strip_fences(text)   # strips ```json ... ``` if present
"""

import asyncio
from ..config import settings


# ── Public helpers ─────────────────────────────────────────────────────────────

def has_llm() -> bool:
    """True when at least one LLM provider is configured."""
    return bool(settings.anthropic_api_key or settings.gemini_api_key)


def active_model() -> str:
    """Human-readable model name for audit logs."""
    if settings.anthropic_api_key:
        return "claude-sonnet-4-6"
    if settings.gemini_api_key:
        return settings.llm_model
    return "none"


def strip_fences(text: str) -> str:
    """Remove markdown code fences (```json … ```) so json.loads works reliably."""
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        if len(parts) >= 2:
            inner = parts[1]
            if inner.startswith("json"):
                inner = inner[4:]
            text = inner.strip()
    return text


def complete(system: str, prompt: str, max_tokens: int = 2048) -> str:
    """Synchronous LLM call — returns raw model text."""
    if settings.anthropic_api_key:
        return _anthropic_complete(system, prompt, max_tokens)
    if settings.gemini_api_key:
        return _gemini_complete(system, prompt, max_tokens)
    raise RuntimeError(
        "No LLM API key configured. "
        "Set ANTHROPIC_API_KEY or GEMINI_API_KEY in backend/.env"
    )


async def acomplete(system: str, prompt: str, max_tokens: int = 2048) -> str:
    """Async LLM call — returns raw model text."""
    if settings.anthropic_api_key:
        return await _anthropic_acomplete(system, prompt, max_tokens)
    if settings.gemini_api_key:
        # Gemini sync runs in a thread to avoid blocking the event loop
        return await asyncio.to_thread(_gemini_complete, system, prompt, max_tokens)
    raise RuntimeError(
        "No LLM API key configured. "
        "Set ANTHROPIC_API_KEY or GEMINI_API_KEY in backend/.env"
    )


# ── Anthropic (Claude) ─────────────────────────────────────────────────────────

def _anthropic_complete(system: str, prompt: str, max_tokens: int) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    msg = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text


async def _anthropic_acomplete(system: str, prompt: str, max_tokens: int) -> str:
    from anthropic import AsyncAnthropic
    client = AsyncAnthropic(api_key=settings.anthropic_api_key)
    resp = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.content[0].text


# ── Google Gemini ──────────────────────────────────────────────────────────────

def _gemini_complete(system: str, prompt: str, max_tokens: int) -> str:
    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(
        model=settings.llm_model,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system,
            max_output_tokens=max_tokens,
        ),
    )
    return response.text
