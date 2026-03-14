"""Add pending_place_ids JSON column to tenants table

Revision ID: 003_pending_place_ids
Revises: 002_bank_transfer
Create Date: 2026-03-15
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

# revision identifiers
revision = "003_pending_place_ids"
down_revision = "002_bank_transfer"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "tenants",
        sa.Column(
            "pending_place_ids",
            JSON,
            nullable=True,
            server_default="[]",
            comment="Place IDs awaiting admin approval",
        ),
    )


def downgrade() -> None:
    op.drop_column("tenants", "pending_place_ids")
