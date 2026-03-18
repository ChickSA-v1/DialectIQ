"""Add ZATCA invoice fields: invoice_number, invoice_pdf_url, vat_amount, total_with_vat

Revision ID: 005_zatca_fields
Revises: 004_add_card_payment_enabled
"""

import sqlalchemy as sa
from alembic import op

revision = "005_zatca_fields"
down_revision = "004_add_card_payment_enabled"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("invoices", sa.Column("invoice_number", sa.String(50), nullable=True, unique=True,
                                         comment="Sequential invoice number e.g. DIQ-2026-000001"))
    op.add_column("invoices", sa.Column("invoice_pdf_url", sa.String(500), nullable=True,
                                         comment="GCS URL for ZATCA-compliant PDF invoice"))
    op.add_column("invoices", sa.Column("vat_amount", sa.Float, nullable=True,
                                         comment="VAT amount (15%)"))
    op.add_column("invoices", sa.Column("total_with_vat", sa.Float, nullable=True,
                                         comment="Total including VAT"))


def downgrade() -> None:
    op.drop_column("invoices", "total_with_vat")
    op.drop_column("invoices", "vat_amount")
    op.drop_column("invoices", "invoice_pdf_url")
    op.drop_column("invoices", "invoice_number")
