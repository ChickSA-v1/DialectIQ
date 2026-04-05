import uuid
from typing import Any

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import verify_api_key
from app.config import get_settings
from app.database import get_db
from app.models import AnalysisResult, Review
from app.schemas import GoogleReviewInput, GoogleReviewResponse
from app.services.email import send_lead_notification_email, send_negative_review_alert
from app.services.reply import generate_reply
from app.services.sentiment import AnalysisError, analyze_reviews

logger = structlog.get_logger()
settings = get_settings()

router = APIRouter(tags=["webhooks"])


@router.post("/reviews", response_model=GoogleReviewResponse)
async def receive_google_review(
    payload: GoogleReviewInput,
    tenant_id: str = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db),
) -> GoogleReviewResponse:
    """
    Receive a Google Maps review from n8n, run sentiment analysis + auto-reply
    via GPT-4o, persist to DB, and return the combined result.

    Enforces:
    - Place ID must be in tenant's allowed list (for DB tenants)
    - Monthly review quota
    """
    from app.models import Tenant  # local import to avoid circular
    from sqlalchemy import select as _select

    logger.info(
        "review_received",
        business=payload.business_name,
        place_id=payload.place_id,
        author=payload.author_name,
        rating=payload.rating,
        text_preview=payload.text[:80],
    )

    # --- Quota & place_id enforcement for DB tenants ---
    tenant_uuid = None
    if tenant_id != settings.default_tenant_id:
        try:
            _tid = uuid.UUID(tenant_id)
            result = await db.execute(_select(Tenant).where(Tenant.id == _tid))
            tenant = result.scalar_one_or_none()
            if tenant:
                tenant_uuid = tenant.id
                # Check place_id is allowed
                allowed = tenant.place_ids or []
                if allowed and payload.place_id not in allowed:
                    raise HTTPException(
                        status_code=403,
                        detail=f"Place ID {payload.place_id} not in allowed list for this tenant",
                    )
                # Check monthly quota
                if tenant.reviews_used_this_month >= tenant.max_reviews_per_month:
                    raise HTTPException(
                        status_code=429,
                        detail=f"Monthly review quota exceeded ({tenant.max_reviews_per_month})",
                    )
                # Increment counter
                tenant.reviews_used_this_month += 1
        except (ValueError, AttributeError):
            pass  # Legacy string tenant_id — no enforcement

    # --- Persist raw review ---
    # Prefer original_text (native language) over text (potentially translated)
    review_text = payload.original_text or payload.text

    review_row = Review(
        id=uuid.uuid4(),
        business_name=payload.business_name,
        place_id=payload.place_id,
        source="google_maps",
        author=payload.author_name,
        raw_text=review_text,
        rating=payload.rating,
        tenant_id=tenant_id,
        tenant_uuid=tenant_uuid,
    )
    db.add(review_row)
    await db.flush()

    # --- Sentiment analysis via GPT-4o ---
    try:
        analyses, sentiment_latency = await analyze_reviews([review_text])
        sentiment = analyses[0]
    except AnalysisError as e:
        logger.error("analysis_failed", error=str(e), place_id=payload.place_id)
        raise HTTPException(status_code=502, detail=f"Analysis engine error: {e}") from e
    except Exception as e:
        logger.error("unexpected_error", error=str(e), place_id=payload.place_id)
        raise HTTPException(status_code=500, detail="Internal analysis error") from e

    # --- Auto-reply generation via GPT-4o ---
    suggested_reply = None
    try:
        suggested_reply, _ = await generate_reply(
            review_text=review_text,
            sentiment_score=sentiment.sentiment_score,
            category=sentiment.category,
            urgency_level=sentiment.urgency_level,
            dialect_detected=sentiment.dialect_detected,
            translated_intent=sentiment.translated_intent,
            author_name=payload.author_name,
            business_name=payload.business_name,
        )
    except Exception as e:
        logger.warning("reply_generation_failed", error=str(e))
        # non-fatal — we still return the sentiment analysis

    # --- Persist analysis result ---
    analysis_row = AnalysisResult(
        review_id=review_row.id,
        sentiment_score=sentiment.sentiment_score,
        category=sentiment.category,
        urgency_level=sentiment.urgency_level,
        dialect_detected=sentiment.dialect_detected,
        translated_intent=sentiment.translated_intent,
        suggested_reply=suggested_reply,
        model_version=settings.openai_model,
        latency_ms=sentiment_latency,
    )
    db.add(analysis_row)

    # commit happens via get_db context manager

    logger.info(
        "review_analyzed",
        business=payload.business_name,
        place_id=payload.place_id,
        sentiment_score=sentiment.sentiment_score,
        category=sentiment.category,
        urgency=sentiment.urgency_level,
        dialect=sentiment.dialect_detected,
        has_reply=suggested_reply is not None,
        latency_ms=sentiment_latency,
    )

    # --- Send email alert for high-urgency reviews (non-blocking) ---
    if sentiment.urgency_level == "High" and tenant_uuid:
        try:
            from app.models import User

            owner_result = await db.execute(
                _select(User).where(User.tenant_id == tenant_uuid, User.role == "owner")
            )
            owner = owner_result.scalar_one_or_none()
            if owner:
                await send_negative_review_alert(
                    to_email=owner.email,
                    business_name=payload.business_name,
                    author=payload.author_name,
                    review_text=review_text,
                    sentiment_score=sentiment.sentiment_score,
                    category=sentiment.category,
                    suggested_reply=suggested_reply,
                )
        except Exception as e:
            logger.warning("negative_review_email_failed", error=str(e))

    return GoogleReviewResponse(
        status="analyzed",
        business_name=payload.business_name,
        place_id=payload.place_id,
        author_name=payload.author_name,
        rating=payload.rating,
        text=payload.text,
        sentiment=sentiment,
        suggested_reply=suggested_reply,
        latency_ms=sentiment_latency,
    )


# ── Google Ads Lead Form Webhook ──────────────────────────────────────


class GoogleAdsColumnData(BaseModel):
    column_id: str
    string_value: str


class GoogleAdsLeadPayload(BaseModel):
    google_key: str
    lead_id: str | None = None
    campaign_id: str | None = None
    gcl_id: str | None = None
    adgroup_id: str | None = None
    creative_id: str | None = None
    user_column_data: list[GoogleAdsColumnData] = []


@router.post("/google-ads-lead")
async def receive_google_ads_lead(payload: GoogleAdsLeadPayload) -> dict[str, str]:
    """
    Receive a lead from Google Ads lead form extension.
    Verifies the google_key and sends an email notification.
    """
    # Verify the webhook key
    if not settings.google_ads_webhook_key or payload.google_key != settings.google_ads_webhook_key:
        logger.warning("google_ads_lead_invalid_key", key=payload.google_key)
        raise HTTPException(status_code=403, detail="Invalid webhook key")

    # Extract user fields from column data
    fields: dict[str, str] = {}
    for col in payload.user_column_data:
        fields[col.column_id] = col.string_value

    name = fields.pop("FULL_NAME", "") or fields.pop("FIRST_NAME", "")
    email = fields.pop("EMAIL", "")
    phone = fields.pop("PHONE_NUMBER", "")

    logger.info(
        "google_ads_lead_received",
        lead_id=payload.lead_id,
        campaign_id=payload.campaign_id,
        name=name,
        email=email,
    )

    # Send email notification (non-blocking — never raises)
    await send_lead_notification_email(
        name=name,
        email=email,
        phone=phone,
        campaign_id=payload.campaign_id,
        extra_fields={k: v for k, v in fields.items() if v},
    )

    return {"status": "ok"}
