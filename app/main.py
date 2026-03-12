import logging

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

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

app.include_router(router)
app.include_router(webhooks_router)
app.include_router(dashboard_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(payment_router)
app.include_router(place_router)


@app.get("/health", tags=["infra"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "dialectiq"}


@app.post("/migrate", tags=["infra"])
async def run_migration() -> dict:
    """
    Run database migration: create all tables + seed admin user.
    Temporary endpoint — remove after first run.
    """
    from app.database import Base, _get_engine, get_db
    from app.models import Tenant, User, Document, Subscription, Invoice  # noqa
    from sqlalchemy import text

    engine = _get_engine()

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Alter existing reviews table: add tenant_uuid if missing, make tenant_id nullable
    async with engine.begin() as conn:
        await conn.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name='reviews' AND column_name='tenant_uuid'
                ) THEN
                    ALTER TABLE reviews ADD COLUMN tenant_uuid UUID REFERENCES tenants(id) ON DELETE SET NULL;
                    CREATE INDEX IF NOT EXISTS ix_reviews_tenant_uuid_created ON reviews (tenant_uuid, created_at);
                END IF;
                ALTER TABLE reviews ALTER COLUMN tenant_id DROP NOT NULL;
            END $$;
        """))

    # Seed admin user if not exists
    from app.security import hash_password
    from sqlalchemy import select
    from sqlalchemy.ext.asyncio import AsyncSession

    async for db in get_db():
        result = await db.execute(select(User).where(User.email == "aalmahlasi@gmail.com"))
        existing = result.scalar_one_or_none()
        if not existing:
            admin = User(
                email="aalmahlasi@gmail.com",
                password_hash=hash_password("DialectIQ2026!"),
                full_name="Ahmed Almahlasi",
                role="admin",
                is_active=True,
                tenant_id=None,
            )
            db.add(admin)
            await db.commit()
            return {"status": "migrated", "admin_created": True}
        return {"status": "migrated", "admin_created": False}
