import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
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
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ── Enums ──────────────────────────────────────────────────────────────
tenant_status_enum = Enum(
    "pending_review", "approved", "rejected", "active", "suspended",
    name="tenant_status_enum", create_constraint=True,
)
package_enum = Enum(
    "basic", "advanced", "enterprise",
    name="package_enum", create_constraint=True,
)
user_role_enum = Enum(
    "admin", "owner",
    name="user_role_enum", create_constraint=True,
)
doc_type_enum = Enum(
    "commercial_registration", "owner_id",
    name="doc_type_enum", create_constraint=True,
)
subscription_status_enum = Enum(
    "pending_payment", "active", "expired", "cancelled",
    name="subscription_status_enum", create_constraint=True,
)
invoice_status_enum = Enum(
    "pending", "paid", "failed", "refunded",
    name="invoice_status_enum", create_constraint=True,
)
payment_method_enum = Enum(
    "card", "bank_transfer",
    name="payment_method_enum", create_constraint=True,
)


# ── Tenant ─────────────────────────────────────────────────────────────
class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name_ar: Mapped[str] = mapped_column(String(255), nullable=False, comment="Arabic business name")
    name_en: Mapped[str | None] = mapped_column(String(255), nullable=True, comment="English name")
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(
        tenant_status_enum, nullable=False, default="pending_review",
    )
    package: Mapped[str] = mapped_column(package_enum, nullable=False, default="basic")
    api_key: Mapped[str | None] = mapped_column(
        String(64), unique=True, nullable=True, index=True,
        comment="Auto-generated on activation: diq_<hex>",
    )
    place_ids: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, default=list, comment='List of confirmed Place IDs ["ChIJ..."]',
    )
    pending_place_ids: Mapped[dict | None] = mapped_column(
        JSON, nullable=True, default=list, comment='Place IDs awaiting admin approval',
    )
    max_businesses: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    max_reviews_per_month: Mapped[int] = mapped_column(Integer, nullable=False, default=500)
    reviews_used_this_month: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    card_payment_enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False,
        comment="Whether card payment (HyperPay) is enabled for this tenant",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    users: Mapped[list["User"]] = relationship(back_populates="tenant", lazy="selectin")
    documents: Mapped[list["Document"]] = relationship(back_populates="tenant", lazy="selectin")
    subscriptions: Mapped[list["Subscription"]] = relationship(back_populates="tenant", lazy="selectin")
    invoices: Mapped[list["Invoice"]] = relationship(back_populates="tenant", lazy="selectin")
    reviews: Mapped[list["Review"]] = relationship(back_populates="tenant", lazy="noload")


# ── User ───────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=True, index=True, comment="NULL for admin users",
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(user_role_enum, nullable=False, default="owner")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    tenant: Mapped["Tenant | None"] = relationship(back_populates="users")


# ── Document ───────────────────────────────────────────────────────────
class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    doc_type: Mapped[str] = mapped_column(
        doc_type_enum, nullable=False,
        comment="commercial_registration or owner_id",
    )
    file_url: Mapped[str] = mapped_column(String(500), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    tenant: Mapped["Tenant"] = relationship(back_populates="documents")


# ── Subscription ───────────────────────────────────────────────────────
class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    package: Mapped[str] = mapped_column(package_enum, nullable=False)
    status: Mapped[str] = mapped_column(
        subscription_status_enum, nullable=False, default="pending_payment",
    )
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    tenant: Mapped["Tenant"] = relationship(back_populates="subscriptions")
    invoices: Mapped[list["Invoice"]] = relationship(back_populates="subscription", lazy="selectin")


# ── Invoice ────────────────────────────────────────────────────────────
class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    subscription_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("subscriptions.id", ondelete="CASCADE"),
        nullable=False,
    )
    amount_sar: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(
        invoice_status_enum, nullable=False, default="pending",
    )
    hyperpay_checkout_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hyperpay_resource_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    payment_method: Mapped[str | None] = mapped_column(
        payment_method_enum, nullable=True, default="card",
        comment="Payment method: card (HyperPay) or bank_transfer",
    )
    transfer_receipt_url: Mapped[str | None] = mapped_column(
        String(500), nullable=True,
        comment="GCS URL for bank transfer receipt/statement",
    )
    transfer_receipt_name: Mapped[str | None] = mapped_column(
        String(255), nullable=True,
        comment="Original filename of bank transfer receipt",
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    tenant: Mapped["Tenant"] = relationship(back_populates="invoices")
    subscription: Mapped["Subscription"] = relationship(back_populates="invoices")


# ── Review (updated with Tenant FK) ───────────────────────────────────
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
    # Legacy string tenant_id kept for backward compat
    tenant_id: Mapped[str | None] = mapped_column(
        String(100), nullable=True, index=True, comment="Legacy tenant ID (string)",
    )
    # New FK to Tenant (nullable for legacy reviews)
    tenant_uuid: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="SET NULL"),
        nullable=True, index=True, comment="FK to tenants table",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    analysis: Mapped["AnalysisResult | None"] = relationship(
        back_populates="review", uselist=False, lazy="selectin"
    )
    tenant: Mapped["Tenant | None"] = relationship(back_populates="reviews")

    __table_args__ = (
        Index("ix_reviews_tenant_created", "tenant_id", "created_at"),
        Index("ix_reviews_place_created", "place_id", "created_at"),
        Index("ix_reviews_tenant_uuid_created", "tenant_uuid", "created_at"),
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
