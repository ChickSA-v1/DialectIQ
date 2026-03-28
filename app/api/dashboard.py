import csv
import io
import math
from datetime import datetime, timedelta

import structlog
from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import Response
from fastapi.security import APIKeyHeader
from sqlalchemy import Date, cast, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import verify_api_key
from app.database import get_db
from app.models import AnalysisResult, Review, User
from app.schemas import DashboardResponse, DashboardStats, ReviewDetail, SentimentTrendPoint
from app.security import decode_access_token

logger = structlog.get_logger()

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def _resolve_tenant_id(request: Request, db: AsyncSession) -> str:
    """
    Resolve tenant_id from JWT Bearer token OR X-API-Key header.
    JWT takes priority if both are present.
    """
    # 1) Try JWT Bearer token
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            payload = decode_access_token(token)
            user_id = payload.get("sub")
            if user_id:
                result = await db.execute(select(User).where(User.id == user_id))
                user = result.scalar_one_or_none()
                if user:
                    if user.role == "admin":
                        # Admin sees all — use legacy tenant_id
                        from app.config import get_settings
                        return get_settings().default_tenant_id
                    if user.tenant_id:
                        return str(user.tenant_id)
        except Exception:
            pass  # fall through to API key

    # 2) Fall back to X-API-Key
    return await verify_api_key(
        api_key=request.headers.get("X-API-Key"),
        db=db,
    )


@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    request: Request,
    place_id: str | None = Query(None, description="Filter by Google place_id"),
    business_name: str | None = Query(None, description="Filter by business name"),
    category: str | None = Query(None, description="Filter by category"),
    urgency: str | None = Query(None, description="Filter by urgency level"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> DashboardResponse:
    """Dashboard endpoint — returns stats + paginated reviews with analysis."""

    tenant_id = await _resolve_tenant_id(request, db)

    # --- Base filter ---
    base_filter = [Review.tenant_id == tenant_id]
    if place_id:
        base_filter.append(Review.place_id == place_id)
    if business_name:
        base_filter.append(Review.business_name.ilike(f"%{business_name}%"))

    analysis_filter = []
    if category:
        analysis_filter.append(AnalysisResult.category == category)
    if urgency:
        analysis_filter.append(AnalysisResult.urgency_level == urgency)

    # --- Stats ---
    count_q = select(func.count(Review.id)).where(*base_filter)
    if analysis_filter:
        count_q = count_q.join(AnalysisResult).where(*analysis_filter)
    total_reviews = (await db.execute(count_q)).scalar() or 0

    avg_q = (
        select(
            func.avg(AnalysisResult.sentiment_score),
            func.avg(Review.rating),
        )
        .join(Review)
        .where(*base_filter)
    )
    if analysis_filter:
        avg_q = avg_q.where(*analysis_filter)
    avg_row = (await db.execute(avg_q)).one_or_none()
    avg_sentiment = round(float(avg_row[0]), 2) if avg_row and avg_row[0] else None
    avg_rating = round(float(avg_row[1]), 2) if avg_row and avg_row[1] else None

    # Urgency breakdown
    urgency_q = (
        select(AnalysisResult.urgency_level, func.count())
        .join(Review)
        .where(*base_filter)
        .group_by(AnalysisResult.urgency_level)
    )
    urgency_rows = (await db.execute(urgency_q)).all()
    urgency_breakdown = {row[0]: row[1] for row in urgency_rows}

    # Category breakdown
    cat_q = (
        select(AnalysisResult.category, func.count())
        .join(Review)
        .where(*base_filter)
        .group_by(AnalysisResult.category)
    )
    cat_rows = (await db.execute(cat_q)).all()
    category_breakdown = {row[0]: row[1] for row in cat_rows}

    # Dialect breakdown
    dialect_q = (
        select(AnalysisResult.dialect_detected, func.count())
        .join(Review)
        .where(*base_filter)
        .group_by(AnalysisResult.dialect_detected)
    )
    dialect_rows = (await db.execute(dialect_q)).all()
    dialect_breakdown = {row[0]: row[1] for row in dialect_rows}

    # Sentiment trend (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    trend_q = (
        select(
            cast(Review.created_at, Date).label("day"),
            func.avg(AnalysisResult.sentiment_score).label("avg_sent"),
            func.count().label("cnt"),
        )
        .join(AnalysisResult)
        .where(*base_filter, Review.created_at >= thirty_days_ago)
        .group_by(cast(Review.created_at, Date))
        .order_by(cast(Review.created_at, Date))
    )
    trend_rows = (await db.execute(trend_q)).all()
    sentiment_trend = [
        SentimentTrendPoint(
            date=str(r.day),
            avg_sentiment=round(float(r.avg_sent), 2),
            count=r.cnt,
        )
        for r in trend_rows
    ]

    # --- Paginated reviews ---
    offset = (page - 1) * page_size
    reviews_q = (
        select(Review)
        .where(*base_filter)
        .order_by(Review.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    if analysis_filter:
        reviews_q = reviews_q.join(AnalysisResult).where(*analysis_filter)

    result = await db.execute(reviews_q)
    review_rows = result.scalars().all()

    reviews = []
    for r in review_rows:
        a = r.analysis  # loaded via selectin
        reviews.append(
            ReviewDetail(
                id=r.id,
                business_name=r.business_name,
                place_id=r.place_id,
                author=r.author,
                raw_text=r.raw_text,
                rating=r.rating,
                source=r.source,
                sentiment_score=a.sentiment_score if a else None,
                category=a.category if a else None,
                urgency_level=a.urgency_level if a else None,
                dialect_detected=a.dialect_detected if a else None,
                translated_intent=a.translated_intent if a else None,
                suggested_reply=a.suggested_reply if a else None,
                created_at=r.created_at,
            )
        )

    return DashboardResponse(
        stats=DashboardStats(
            total_reviews=total_reviews,
            avg_sentiment=avg_sentiment,
            avg_rating=avg_rating,
            urgency_breakdown=urgency_breakdown,
            category_breakdown=category_breakdown,
            dialect_breakdown=dialect_breakdown,
            sentiment_trend=sentiment_trend,
        ),
        reviews=reviews,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(total_reviews / page_size)),
    )


@router.get("/export")
async def export_reviews(
    request: Request,
    place_id: str | None = Query(None),
    business_name: str | None = Query(None),
    category: str | None = Query(None),
    urgency: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Export all filtered reviews as a CSV file."""
    tenant_id = await _resolve_tenant_id(request, db)

    base_filter = [Review.tenant_id == tenant_id]
    if place_id:
        base_filter.append(Review.place_id == place_id)
    if business_name:
        base_filter.append(Review.business_name.ilike(f"%{business_name}%"))

    reviews_q = (
        select(Review)
        .join(AnalysisResult)
        .where(*base_filter)
        .order_by(Review.created_at.desc())
        .limit(10000)
    )
    if category:
        reviews_q = reviews_q.where(AnalysisResult.category == category)
    if urgency:
        reviews_q = reviews_q.where(AnalysisResult.urgency_level == urgency)

    result = await db.execute(reviews_q)
    rows = result.scalars().all()

    output = io.StringIO()
    # Add BOM for Excel Arabic support
    output.write("\ufeff")
    writer = csv.writer(output)
    writer.writerow([
        "Date", "Author", "Business", "Rating", "Review Text",
        "Sentiment Score", "Category", "Urgency", "Dialect", "Suggested Reply",
    ])
    for r in rows:
        a = r.analysis
        writer.writerow([
            r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "",
            r.author or "",
            r.business_name or "",
            r.rating or "",
            r.raw_text or "",
            a.sentiment_score if a else "",
            a.category if a else "",
            a.urgency_level if a else "",
            a.dialect_detected if a else "",
            a.suggested_reply if a else "",
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=reviews_export.csv"},
    )
