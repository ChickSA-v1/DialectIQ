"""Add tenant system: tenants, users, documents, subscriptions, invoices

Revision ID: 001_tenant_system
Revises:
Create Date: 2026-03-12
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = "001_tenant_system"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Enums ──────────────────────────────────────────────────────────
    tenant_status = sa.Enum(
        "pending_review", "approved", "rejected", "active", "suspended",
        name="tenant_status_enum",
    )
    package = sa.Enum("basic", "advanced", "enterprise", name="package_enum")
    user_role = sa.Enum("admin", "owner", name="user_role_enum")
    doc_type = sa.Enum("commercial_registration", "owner_id", name="doc_type_enum")
    subscription_status = sa.Enum(
        "pending_payment", "active", "expired", "cancelled",
        name="subscription_status_enum",
    )
    invoice_status = sa.Enum(
        "pending", "paid", "failed", "refunded",
        name="invoice_status_enum",
    )

    # Create enums first
    tenant_status.create(op.get_bind(), checkfirst=True)
    package.create(op.get_bind(), checkfirst=True)
    user_role.create(op.get_bind(), checkfirst=True)
    doc_type.create(op.get_bind(), checkfirst=True)
    subscription_status.create(op.get_bind(), checkfirst=True)
    invoice_status.create(op.get_bind(), checkfirst=True)

    # ── Tenants table ──────────────────────────────────────────────────
    op.create_table(
        "tenants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name_ar", sa.String(255), nullable=False),
        sa.Column("name_en", sa.String(255), nullable=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("phone", sa.String(20), nullable=False),
        sa.Column("status", tenant_status, nullable=False, server_default="pending_review"),
        sa.Column("package", package, nullable=False, server_default="basic"),
        sa.Column("api_key", sa.String(64), unique=True, nullable=True),
        sa.Column("place_ids", postgresql.JSON(), nullable=True),
        sa.Column("max_businesses", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("max_reviews_per_month", sa.Integer(), nullable=False, server_default="500"),
        sa.Column("reviews_used_this_month", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_tenants_email", "tenants", ["email"])
    op.create_index("ix_tenants_api_key", "tenants", ["api_key"])

    # ── Users table ────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role", user_role, nullable=False, server_default="owner"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_tenant_id", "users", ["tenant_id"])

    # ── Documents table ────────────────────────────────────────────────
    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("doc_type", doc_type, nullable=False),
        sa.Column("file_url", sa.String(500), nullable=False),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_documents_tenant_id", "documents", ["tenant_id"])

    # ── Subscriptions table ────────────────────────────────────────────
    op.create_table(
        "subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("package", package, nullable=False),
        sa.Column("status", subscription_status, nullable=False, server_default="pending_payment"),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_subscriptions_tenant_id", "subscriptions", ["tenant_id"])

    # ── Invoices table ─────────────────────────────────────────────────
    op.create_table(
        "invoices",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("subscription_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("amount_sar", sa.Float(), nullable=False),
        sa.Column("status", invoice_status, nullable=False, server_default="pending"),
        sa.Column("hyperpay_checkout_id", sa.String(255), nullable=True),
        sa.Column("hyperpay_resource_path", sa.String(500), nullable=True),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_invoices_tenant_id", "invoices", ["tenant_id"])

    # ── Update reviews table: add tenant_uuid column ───────────────────
    op.add_column(
        "reviews",
        sa.Column("tenant_uuid", postgresql.UUID(as_uuid=True), sa.ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("ix_reviews_tenant_uuid_created", "reviews", ["tenant_uuid", "created_at"])

    # Make tenant_id nullable for backward compatibility
    op.alter_column("reviews", "tenant_id", nullable=True)


def downgrade() -> None:
    # Revert reviews
    op.alter_column("reviews", "tenant_id", nullable=False)
    op.drop_index("ix_reviews_tenant_uuid_created", table_name="reviews")
    op.drop_column("reviews", "tenant_uuid")

    # Drop tables in reverse order
    op.drop_table("invoices")
    op.drop_table("subscriptions")
    op.drop_table("documents")
    op.drop_table("users")
    op.drop_table("tenants")

    # Drop enums
    sa.Enum(name="invoice_status_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="subscription_status_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="doc_type_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="user_role_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="package_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="tenant_status_enum").drop(op.get_bind(), checkfirst=True)
