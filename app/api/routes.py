import uuid

import structlog
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.models import AnalysisResult, Review
from app.schemas import AnalyzeRequest, AnalyzeResponse, ReviewResult
from app.services.sentiment import AnalysisError, analyze_reviews

logger = structlog.get_logger()
settings = get_settings()

router = APIRouter(prefix="/api/v1", tags=["sentiment"])


@router.post("/analyze-sentiment", response_model=AnalyzeResponse)
async def analyze_sentiment(
    payload: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
) -> AnalyzeResponse:
    """
    Analyze sentiment for a batch of Saudi customer reviews.
    Supports Arabic (all dialects), Arabizi, and mixed text.
    """
    if len(payload.reviews) > settings.max_batch_size:
        raise HTTPException(
            status_code=422,
            detail=f"Batch size {len(payload.reviews)} exceeds max of {settings.max_batch_size}",
        )

    # --- Persist raw reviews ---
    review_rows: list[Review] = []
    for r in payload.reviews:
        row = Review(
            id=uuid.uuid4(),
            raw_text=r.text,
            source=r.source,
            author=r.author,
            tenant_id=payload.tenant_id,
        )
        db.add(row)
        review_rows.append(row)

    await db.flush()  # generate IDs without committing

    # --- Call Claude ---
    texts = [r.text for r in payload.reviews]

    try:
        analyses, latency_ms = await analyze_reviews(texts)
    except AnalysisError as e:
        logger.error("analysis_failed", error=str(e), tenant=payload.tenant_id)
        raise HTTPException(status_code=502, detail=f"Analysis engine error: {e}") from e
    except Exception as e:
        logger.error("unexpected_error", error=str(e), tenant=payload.tenant_id)
        raise HTTPException(status_code=500, detail="Internal analysis error") from e

    # --- Persist analysis results ---
    results: list[ReviewResult] = []
    for review_row, analysis in zip(review_rows, analyses):
        analysis_row = AnalysisResult(
            review_id=review_row.id,
            sentiment_score=analysis.sentiment_score,
            category=analysis.category,
            urgency_level=analysis.urgency_level,
            dialect_detected=analysis.dialect_detected,
            translated_intent=analysis.translated_intent,
            model_version=settings.claude_model,
            latency_ms=latency_ms,
        )
        db.add(analysis_row)

        results.append(
            ReviewResult(
                review_id=review_row.id,
                raw_text=review_row.raw_text,
                analysis=analysis,
            )
        )

    # commit happens automatically via get_db context manager

    logger.info(
        "batch_analyzed",
        tenant=payload.tenant_id,
        count=len(results),
        latency_ms=latency_ms,
    )

    return AnalyzeResponse(
        tenant_id=payload.tenant_id,
        count=len(results),
        results=results,
        total_latency_ms=latency_ms,
    )
