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


