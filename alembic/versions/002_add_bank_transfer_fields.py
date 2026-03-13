"""Add bank transfer fields to invoices: payment_method, transfer_receipt_url

Revision ID: 002_bank_transfer
Revises: 001_tenant_system
Create Date: 2026-03-13
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = "002_bank_transfer"
down_revision = "001_tenant_system"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add payment_method column (card or bank_transfer), default 'card'
    payment_method_enum = sa.Enum("card", "bank_transfer", name="payment_method_enum")
    payment_method_enum.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "invoices",
        sa.Column(
            "payment_method",
            payment_method_enum,
            nullable=True,
            server_default="card",
            comment="Payment method: card (HyperPay) or bank_transfer",
        ),
    )

    # Add transfer_receipt_url for bank transfer receipt file
    op.add_column(
        "invoices",
        sa.Column(
            "transfer_receipt_url",
            sa.String(500),
            nullable=True,
            comment="GCS URL for bank transfer receipt/statement",
        ),
    )

    # Add transfer_receipt_name for display
    op.add_column(
        "invoices",
        sa.Column(
            "transfer_receipt_name",
            sa.String(255),
            nullable=True,
            comment="Original filename of bank transfer receipt",
        ),
    )


def downgrade() -> None:
    op.drop_column("invoices", "transfer_receipt_name")
    op.drop_column("invoices", "transfer_receipt_url")
    op.drop_column("invoices", "payment_method")

    payment_method_enum = sa.Enum("card", "bank_transfer", name="payment_method_enum")
    payment_method_enum.drop(op.get_bind(), checkfirst=True)
