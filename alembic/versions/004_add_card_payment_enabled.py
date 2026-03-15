"""Add card_payment_enabled boolean column to tenants table

Revision ID: 004_card_payment_enabled
Revises: 003_pending_place_ids
Create Date: 2026-03-15
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "004_card_payment_enabled"
down_revision = "003_pending_place_ids"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "tenants",
        sa.Column(
            "card_payment_enabled",
            sa.Boolean(),
            nullable=False,
            server_default="false",
            comment="Whether card payment (HyperPay) is enabled for this tenant",
        ),
    )


def downgrade() -> None:
    op.drop_column("tenants", "card_payment_enabled")
