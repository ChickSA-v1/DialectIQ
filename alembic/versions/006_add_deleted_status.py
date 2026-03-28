"""Add 'deleted' to tenant_status_enum

Revision ID: 006_add_deleted_status
Revises: 005_zatca_fields
"""

from alembic import op

revision = "006_add_deleted_status"
down_revision = "005_zatca_fields"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TYPE tenant_status_enum ADD VALUE IF NOT EXISTS 'deleted'")


def downgrade() -> None:
    # PostgreSQL does not support removing enum values; no-op
    pass
