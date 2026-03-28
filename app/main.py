import logging

import structlog
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, ORJSONResponse

from app.api.admin_routes import router as admin_router
from app.api.auth_routes import place_router, router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.payment_routes import router as payment_router
from app.api.routes import router
from app.api.webhooks import router as webhooks_router
from app.config import get_settings

settings = get_settings()

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer() if settings.environment == "development"
        else structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        getattr(logging, settings.log_level.upper(), logging.INFO)
    ),
)

app = FastAPI(
    title="DialectIQ",
    description="Saudi dialect-aware sentiment analysis engine powered by GPT-4o",
    version="0.1.0",
    default_response_class=ORJSONResponse,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

log = structlog.get_logger()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Log 422 validation errors for debugging."""
    log.warning(
        "validation_error",
        url=str(request.url),
        method=request.method,
        errors=exc.errors(),
    )
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


app.include_router(router)
app.include_router(webhooks_router)
app.include_router(dashboard_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(payment_router)
app.include_router(place_router)


@app.on_event("startup")
async def run_migrations():
    """Auto-add new columns on startup (idempotent)."""
    from app.database import _get_engine
    from sqlalchemy import text

    engine = _get_engine()
    async with engine.begin() as conn:
        await conn.execute(text(
            "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS "
            "card_payment_enabled BOOLEAN NOT NULL DEFAULT FALSE"
        ))
        await conn.execute(text(
            "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS "
            "competitor_place_ids JSONB DEFAULT '[]'"
        ))
        await conn.execute(text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS "
            "allowed_place_ids JSONB DEFAULT NULL"
        ))
        # Add 'member' to user_role_enum if not exists
        await conn.execute(text(
            "ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'member'"
        ))
        # Add 'deleted' to tenant_status_enum if not exists
        await conn.execute(text(
            "ALTER TYPE tenant_status_enum ADD VALUE IF NOT EXISTS 'deleted'"
        ))


@app.get("/debug/fonts", tags=["infra"])
async def debug_fonts():
    """Check if Arabic fonts are available."""
    import os
    from pathlib import Path
    font_dir = Path(__file__).resolve().parent / "assets" / "fonts"
    files = list(font_dir.glob("*")) if font_dir.exists() else []
    return {
        "font_dir": str(font_dir),
        "exists": font_dir.exists(),
        "files": [{"name": f.name, "size": f.stat().st_size} for f in files],
    }


@app.get("/health", tags=["infra"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "dialectiq"}


