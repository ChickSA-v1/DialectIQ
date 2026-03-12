import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    business_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    place_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    source: Mapped[str | None] = mapped_column(
        String(50), nullable=True, default="google_maps",
        comment="google_maps, twitter, whatsapp, manual",
    )
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True, comment="1-5 star rating")
    tenant_id: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True, comment="B2B tenant isolation"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    analysis: Mapped["AnalysisResult | None"] = relationship(
        back_populates="review", uselist=False, lazy="selectin"
    )

    __table_args__ = (
        Index("ix_reviews_tenant_created", "tenant_id", "created_at"),
        Index("ix_reviews_place_created", "place_id", "created_at"),
    )


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("reviews.id", ondelete="CASCADE"),
        unique=True, nullable=False,
    )
    sentiment_score: Mapped[float] = mapped_column(Float, nullable=False, comment="1-10 scale")
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    urgency_level: Mapped[str] = mapped_column(
        Enum("Low", "Medium", "High", name="urgency_enum", create_constraint=True),
        nullable=False,
    )
    dialect_detected: Mapped[str] = mapped_column(String(50), nullable=False)
    translated_intent: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_reply: Mapped[str | None] = mapped_column(
        Text, nullable=True, comment="AI-generated culturally appropriate reply"
    )
    model_version: Mapped[str] = mapped_column(String(50), nullable=False, comment="AI model used (e.g. gpt-4o)")
    latency_ms: Mapped[int | None] = mapped_column(nullable=True, comment="API call latency")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    review: Mapped[Review] = relationship(back_populates="analysis")

    __table_args__ = (
        Index("ix_analysis_category", "category"),
        Index("ix_analysis_urgency", "urgency_level"),
        Index("ix_analysis_sentiment", "sentiment_score"),
        Index("ix_analysis_created", "created_at"),
    )
