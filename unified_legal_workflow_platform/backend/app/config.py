from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # ── LLM providers (set one — Anthropic takes priority if both are set) ────
    anthropic_api_key: str = ""
    gemini_api_key: str = ""
    llm_model: str = "gemini-2.0-flash"   # used when gemini_api_key is active

    # ── Core ──────────────────────────────────────────────────────────────────
    database_url: str = "sqlite:///./caseflow.db"
    secret_key: str = "dev-secret-key-change-in-production"
    access_token_expire_minutes: int = 480
    environment: str = "development"

    # ── Connectors (v2) ───────────────────────────────────────────────────────
    microsoft_client_id: Optional[str] = None
    microsoft_client_secret: Optional[str] = None
    microsoft_tenant_id: Optional[str] = None

    slack_bot_token: Optional[str] = None
    slack_app_token: Optional[str] = None

    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None

    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()
