import structlog
from fastapi import APIRouter, HTTPException

from app.schemas import GoogleReviewInput, GoogleReviewResponse
from app.services.sentiment import AnalysisError, analyze_reviews

logger = structlog.get_logger()

router = APIRouter(tags=["webhooks"])


@router.post("/reviews", response_model=GoogleReviewResponse)
async def receive_google_review(payload: GoogleReviewInput) -> GoogleReviewResponse:
    """
    Receive a single Google Maps review from the n8n webhook,
    run Saudi-dialect sentiment analysis via Claude, and return
    the combined result. Supports any business type (restaurants,
    clinics, banks, telecom, government services, etc.).
    """
    logger.info(
        "review_received",
        business=payload.business_name,
        place_id=payload.place_id,
        author=payload.author_name,
        rating=payload.rating,
        text_preview=payload.text[:80],
    )

    # --- Sentiment analysis via Claude ---
    try:
        analyses, latency_ms = await analyze_reviews([payload.text])
        sentiment = analyses[0]
    except AnalysisError as e:
        logger.error("analysis_failed", error=str(e), place_id=payload.place_id)
        raise HTTPException(status_code=502, detail=f"Analysis engine error: {e}") from e
    except Exception as e:
        logger.error("unexpected_error", error=str(e), place_id=payload.place_id)
        raise HTTPException(status_code=500, detail="Internal analysis error") from e

    # --- Build combined response ---
    result = GoogleReviewResponse(
        status="analyzed",
        business_name=payload.business_name,
        place_id=payload.place_id,
        author_name=payload.author_name,
        rating=payload.rating,
        text=payload.text,
        sentiment=sentiment,
        latency_ms=latency_ms,
    )

    # --- Simulate DB save (print to Cloud Run logs) ---
    print(f"[DB_SAVE] {result.model_dump_json()}")

    logger.info(
        "review_analyzed",
        business=payload.business_name,
        place_id=payload.place_id,
        sentiment_score=sentiment.sentiment_score,
        category=sentiment.category,
        urgency=sentiment.urgency_level,
        dialect=sentiment.dialect_detected,
        latency_ms=latency_ms,
    )

    return result
