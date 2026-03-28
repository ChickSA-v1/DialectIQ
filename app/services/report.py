"""
Weekly report service — generates and emails a summary of the past 7 days.
"""

import uuid
from datetime import datetime, timedelta

import structlog
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AnalysisResult, Review, Tenant, User
from app.services.email import _send_email

log = structlog.get_logger()


async def generate_weekly_report(tenant_uuid: uuid.UUID, db: AsyncSession) -> dict:
    """Compute weekly stats for a tenant."""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    base = [Review.tenant_uuid == tenant_uuid]

    # This week
    this_week = [*base, Review.created_at >= week_ago]
    count_q = select(func.count(Review.id)).where(*this_week)
    total = (await db.execute(count_q)).scalar() or 0

    avg_q = (
        select(func.avg(AnalysisResult.sentiment_score), func.avg(Review.rating))
        .join(Review)
        .where(*this_week)
    )
    avg_row = (await db.execute(avg_q)).one_or_none()
    avg_sentiment = round(float(avg_row[0]), 2) if avg_row and avg_row[0] else None
    avg_rating = round(float(avg_row[1]), 2) if avg_row and avg_row[1] else None

    # Last week (for comparison)
    last_week = [*base, Review.created_at >= two_weeks_ago, Review.created_at < week_ago]
    prev_avg_q = (
        select(func.avg(AnalysisResult.sentiment_score))
        .join(Review)
        .where(*last_week)
    )
    prev_avg = (await db.execute(prev_avg_q)).scalar()
    prev_sentiment = round(float(prev_avg), 2) if prev_avg else None

    sentiment_delta = None
    if avg_sentiment is not None and prev_sentiment is not None:
        sentiment_delta = round(avg_sentiment - prev_sentiment, 2)

    # Top categories (complaints)
    cat_q = (
        select(AnalysisResult.category, func.count().label("cnt"))
        .join(Review)
        .where(*this_week)
        .group_by(AnalysisResult.category)
        .order_by(func.count().desc())
        .limit(3)
    )
    top_categories = [(r[0], r[1]) for r in (await db.execute(cat_q)).all()]

    # Urgency breakdown
    urg_q = (
        select(AnalysisResult.urgency_level, func.count())
        .join(Review)
        .where(*this_week)
        .group_by(AnalysisResult.urgency_level)
    )
    urgency = {r[0]: r[1] for r in (await db.execute(urg_q)).all()}

    return {
        "total_reviews": total,
        "avg_sentiment": avg_sentiment,
        "avg_rating": avg_rating,
        "sentiment_delta": sentiment_delta,
        "top_categories": top_categories,
        "urgency_breakdown": urgency,
        "period_start": week_ago.strftime("%Y-%m-%d"),
        "period_end": now.strftime("%Y-%m-%d"),
    }


def _build_weekly_report_html(report: dict, business_name: str) -> str:
    """Build styled HTML email for weekly report."""
    delta_html = ""
    if report["sentiment_delta"] is not None:
        delta = report["sentiment_delta"]
        arrow = "&#9650;" if delta > 0 else "&#9660;" if delta < 0 else "&#9644;"
        color = "#10b981" if delta > 0 else "#ef4444" if delta < 0 else "#94a3b8"
        delta_html = f'<span style="color: {color}; font-size: 13px; margin-right: 6px;">{arrow} {abs(delta):+.1f}</span>'

    categories_html = ""
    for cat, count in report["top_categories"]:
        categories_html += f"""
        <tr>
          <td style="padding: 8px 0; color: #1e293b; font-size: 14px; border-top: 1px solid #f1f5f9;">{cat}</td>
          <td style="padding: 8px 0; color: #64748b; font-size: 14px; border-top: 1px solid #f1f5f9; text-align: left;">{count} تقييم</td>
        </tr>
        """

    high_count = report["urgency_breakdown"].get("High", 0)

    return f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; padding: 24px;">
      <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #0891b2, #06b6d4); padding: 28px 24px; text-align: center;">
          <div style="width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <span style="color: white; font-weight: bold; font-size: 20px;">D</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">التقرير الأسبوعي</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">{business_name} — {report['period_start']} إلى {report['period_end']}</p>
        </div>

        <div style="padding: 24px;">
          <!-- Stats Row -->
          <div style="display: flex; gap: 12px; margin-bottom: 20px;">
            <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 16px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 11px;">إجمالي التقييمات</p>
              <p style="margin: 4px 0 0; color: #1e293b; font-size: 24px; font-weight: 700;">{report['total_reviews']}</p>
            </div>
            <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 16px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 11px;">متوسط المشاعر</p>
              <p style="margin: 4px 0 0; color: #1e293b; font-size: 24px; font-weight: 700;">{report['avg_sentiment'] or '—'}/10</p>
              {delta_html}
            </div>
            <div style="flex: 1; background: #f8fafc; border-radius: 12px; padding: 16px; text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 11px;">متوسط التقييم</p>
              <p style="margin: 4px 0 0; color: #1e293b; font-size: 24px; font-weight: 700;">{report['avg_rating'] or '—'} &#9733;</p>
            </div>
          </div>

          {'<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 12px; margin-bottom: 20px; text-align: center;"><span style="color: #ef4444; font-weight: 700;">' + str(high_count) + '</span> <span style="color: #64748b; font-size: 13px;">تقييم بأولوية عالية هذا الأسبوع</span></div>' if high_count > 0 else ''}

          <!-- Top Categories -->
          <h3 style="color: #1e293b; font-size: 14px; font-weight: 700; margin: 0 0 8px;">أبرز المواضيع</h3>
          <table style="width: 100%; border-collapse: collapse; direction: rtl;">
            {categories_html or '<tr><td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">لا توجد بيانات كافية</td></tr>'}
          </table>

          <div style="text-align: center; margin-top: 24px;">
            <a href="https://d-iq.io/client" style="display: inline-block; background: linear-gradient(135deg, #0891b2, #06b6d4); color: white; padding: 12px 32px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">
              افتح لوحة التحكم
            </a>
          </div>
        </div>

        <div style="padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">DialectIQ Weekly Report &mdash; d-iq.io</p>
        </div>
      </div>
    </div>
    """


async def send_weekly_report(tenant_uuid: uuid.UUID, db: AsyncSession) -> None:
    """Generate and send a weekly report email to the tenant owner."""
    tenant_result = await db.execute(select(Tenant).where(Tenant.id == tenant_uuid))
    tenant = tenant_result.scalar_one_or_none()
    if not tenant:
        log.warning("weekly_report_skip_no_tenant", tenant_id=str(tenant_uuid))
        return

    owner_result = await db.execute(
        select(User).where(User.tenant_id == tenant_uuid, User.role == "owner")
    )
    owner = owner_result.scalar_one_or_none()
    if not owner:
        log.warning("weekly_report_skip_no_owner", tenant_id=str(tenant_uuid))
        return

    report = await generate_weekly_report(tenant_uuid, db)

    if report["total_reviews"] == 0:
        log.info("weekly_report_skip_no_reviews", tenant_id=str(tenant_uuid))
        return

    business_name = tenant.name_ar or tenant.name_en or "عملك"
    html = _build_weekly_report_html(report, business_name)

    plain = (
        f"التقرير الأسبوعي — {business_name}\n"
        f"الفترة: {report['period_start']} إلى {report['period_end']}\n\n"
        f"إجمالي التقييمات: {report['total_reviews']}\n"
        f"متوسط المشاعر: {report['avg_sentiment']}/10\n"
        f"متوسط التقييم: {report['avg_rating']}\n\n"
        f"افتح لوحة التحكم: https://d-iq.io/client"
    )

    await _send_email(
        to=owner.email,
        subject=f"التقرير الأسبوعي: {business_name}",
        plain=plain,
        html=html,
    )
    log.info("weekly_report_sent", tenant_id=str(tenant_uuid), to=owner.email)
