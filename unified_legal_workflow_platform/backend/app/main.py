from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import engine, Base, SessionLocal
from .api import matters, intake, timelines, tasks, knowledge, audit, notes, drafts, connectors
from .config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Seed demo data
    db = SessionLocal()
    try:
        from .services.mock_data import seed_demo_data
        seed_demo_data(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="CaseFlow MCP",
    description="MCP-first unified legal workflow platform for attorneys",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matters.router, prefix="/api")
app.include_router(intake.router, prefix="/api")
app.include_router(timelines.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")
app.include_router(audit.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(drafts.router, prefix="/api")
app.include_router(connectors.router, prefix="/api")


@app.get("/")
def root():
    return {
        "name": "CaseFlow MCP",
        "version": "1.0.0",
        "description": "MCP-first unified legal workflow platform",
        "docs": "/docs",
        "ai_enabled": bool(settings.anthropic_api_key or settings.gemini_api_key),
        "ai_provider": "anthropic" if settings.anthropic_api_key else ("gemini" if settings.gemini_api_key else "none"),
    }


@app.get("/health")
def health():
    return {"status": "ok", "environment": settings.environment}
