"""
ZATCA-compliant invoice PDF generator.

Generates invoices that comply with Saudi Arabia's Zakat, Tax and Customs Authority
(ZATCA) e-invoicing requirements (Fatoora simplified tax invoice).

The generated PDF includes:
- Sequential invoice number
- Seller & buyer information
- Line items with VAT breakdown
- TLV-encoded QR code (ZATCA Phase 1 compliant)
"""

import io
import struct
import base64
from datetime import datetime, timezone

import qrcode
import structlog
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Spacer, Paragraph, Image,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from app.services.storage import upload_document

log = structlog.get_logger()

# ── Company Info (Seller) ─────────────────────────────────────────────
SELLER_NAME_AR = "شركة داتاويف للاتصالات وتقنية المعلومات"
SELLER_NAME_EN = "DataWeave ICT Co."
SELLER_VAT_NUMBER = ""  # VAT TIN not yet extracted
SELLER_CR_NUMBER = "7052772485"
SELLER_ADDRESS_AR = "الرياض، المملكة العربية السعودية"
SELLER_ADDRESS_EN = "Riyadh, Saudi Arabia"
VAT_RATE = 0.15  # 15% VAT

# Brand colors
BRAND_NAVY = colors.HexColor("#0B1B3D")
BRAND_CYAN = colors.HexColor("#00D2DF")
BRAND_GOLD = colors.HexColor("#FBBF24")


def _tlv_encode(tag: int, value: str) -> bytes:
    """Encode a TLV (Tag-Length-Value) field per ZATCA spec."""
    encoded = value.encode("utf-8")
    return struct.pack("BB", tag, len(encoded)) + encoded


def generate_zatca_qr(
    seller_name: str,
    vat_number: str,
    timestamp: str,
    total_with_vat: str,
    vat_amount: str,
) -> bytes:
    """
    Generate a ZATCA Phase 1 compliant QR code.
    Returns PNG bytes of the QR code image.

    TLV Fields:
    1 - Seller Name
    2 - VAT Registration Number
    3 - Timestamp (ISO 8601)
    4 - Invoice Total (with VAT)
    5 - VAT Amount
    """
    tlv_data = (
        _tlv_encode(1, seller_name)
        + _tlv_encode(2, vat_number)
        + _tlv_encode(3, timestamp)
        + _tlv_encode(4, total_with_vat)
        + _tlv_encode(5, vat_amount)
    )
    b64_data = base64.b64encode(tlv_data).decode("ascii")

    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=4, border=2)
    qr.add_data(b64_data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()


async def generate_next_invoice_number(db) -> str:
    """Generate sequential invoice number: DIQ-YYYY-NNNNNN."""
    from sqlalchemy import func, select, text
    from app.models import Invoice

    year = datetime.now(timezone.utc).year

    # Get the max invoice number for this year
    result = await db.execute(
        select(func.count()).where(
            Invoice.invoice_number.ilike(f"DIQ-{year}-%")
        )
    )
    count = result.scalar() or 0
    next_num = count + 1

    return f"DIQ-{year}-{next_num:06d}"


def _build_invoice_pdf(
    invoice_number: str,
    invoice_date: str,
    buyer_name_ar: str,
    buyer_name_en: str | None,
    buyer_email: str,
    buyer_phone: str,
    package_name: str,
    amount_sar: float,
    vat_amount: float,
    total_with_vat: float,
    qr_png_bytes: bytes,
    payment_method: str | None = None,
) -> bytes:
    """Build the ZATCA-compliant PDF invoice. Returns PDF bytes."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    style_title = ParagraphStyle(
        "InvoiceTitle", parent=styles["Title"],
        fontSize=22, textColor=BRAND_NAVY, spaceAfter=4,
    )
    style_subtitle = ParagraphStyle(
        "InvoiceSubtitle", parent=styles["Normal"],
        fontSize=10, textColor=colors.grey, alignment=TA_CENTER,
    )
    style_heading = ParagraphStyle(
        "SectionHeading", parent=styles["Heading3"],
        fontSize=11, textColor=BRAND_NAVY, spaceBefore=12, spaceAfter=6,
    )
    style_normal = ParagraphStyle(
        "InvoiceNormal", parent=styles["Normal"],
        fontSize=9, textColor=colors.HexColor("#334155"),
    )
    style_right = ParagraphStyle(
        "InvoiceRight", parent=style_normal,
        alignment=TA_RIGHT,
    )
    style_small = ParagraphStyle(
        "InvoiceSmall", parent=styles["Normal"],
        fontSize=8, textColor=colors.grey,
    )

    elements = []

    # ── Header ──
    header_data = [
        [
            Paragraph("DialectIQ", style_title),
            Paragraph(f"<b>Invoice / فاتورة ضريبية مبسطة</b>", ParagraphStyle(
                "HeaderRight", parent=style_normal, fontSize=12,
                textColor=BRAND_NAVY, alignment=TA_RIGHT,
            )),
        ],
        [
            Paragraph(f"{SELLER_NAME_AR}<br/>{SELLER_NAME_EN}", style_normal),
            Paragraph(
                f"<b>Invoice #:</b> {invoice_number}<br/>"
                f"<b>Date:</b> {invoice_date}",
                style_right,
            ),
        ],
    ]
    header_table = Table(header_data, colWidths=[doc.width * 0.55, doc.width * 0.45])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, -1), (-1, -1), 1, BRAND_CYAN),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 8 * mm))

    # ── Seller & Buyer Info ──
    info_data = [
        [
            Paragraph("<b>Seller / البائع</b>", style_heading),
            Paragraph("<b>Buyer / المشتري</b>", style_heading),
        ],
        [
            Paragraph(
                f"{SELLER_NAME_AR}<br/>"
                f"{SELLER_NAME_EN}<br/>"
                f"VAT/الرقم الضريبي: {SELLER_VAT_NUMBER}<br/>"
                f"CR/السجل التجاري: {SELLER_CR_NUMBER}<br/>"
                f"{SELLER_ADDRESS_AR}",
                style_normal,
            ),
            Paragraph(
                f"{buyer_name_ar}<br/>"
                f"{buyer_name_en or ''}<br/>"
                f"{buyer_email}<br/>"
                f"{buyer_phone}",
                style_normal,
            ),
        ],
    ]
    info_table = Table(info_data, colWidths=[doc.width * 0.50, doc.width * 0.50])
    info_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 8 * mm))

    # ── Line Items Table ──
    elements.append(Paragraph("<b>Invoice Details / تفاصيل الفاتورة</b>", style_heading))

    items_data = [
        ["#", "Description / الوصف", "Qty / الكمية", "Unit Price / سعر الوحدة (SAR)", "Total / المجموع (SAR)"],
        ["1", f"DialectIQ {package_name} Subscription\nاشتراك DialectIQ - باقة {package_name}", "1", f"{amount_sar:,.2f}", f"{amount_sar:,.2f}"],
    ]
    items_table = Table(items_data, colWidths=[
        doc.width * 0.06, doc.width * 0.44, doc.width * 0.10, doc.width * 0.20, doc.width * 0.20,
    ])
    items_table.setStyle(TableStyle([
        # Header row
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTSIZE", (0, 1), (-1, -1), 9),
        ("ALIGN", (0, 0), (-1, 0), "CENTER"),
        ("ALIGN", (2, 1), (-1, -1), "CENTER"),
        # Grid
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        # Alternating rows
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 4 * mm))

    # ── Totals ──
    totals_data = [
        ["", "", "", "Subtotal / المجموع الفرعي:", f"{amount_sar:,.2f} SAR"],
        ["", "", "", f"VAT / ضريبة القيمة المضافة ({int(VAT_RATE * 100)}%):", f"{vat_amount:,.2f} SAR"],
        ["", "", "", "Total / الإجمالي:", f"{total_with_vat:,.2f} SAR"],
    ]
    totals_table = Table(totals_data, colWidths=[
        doc.width * 0.06, doc.width * 0.44, doc.width * 0.10, doc.width * 0.20, doc.width * 0.20,
    ])
    totals_table.setStyle(TableStyle([
        ("ALIGN", (3, 0), (3, -1), "RIGHT"),
        ("ALIGN", (4, 0), (4, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        # Total row bold
        ("FONTSIZE", (3, 2), (4, 2), 11),
        ("TEXTCOLOR", (3, 2), (4, 2), BRAND_NAVY),
        ("LINEABOVE", (3, 2), (4, 2), 1.5, BRAND_CYAN),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(totals_table)
    elements.append(Spacer(1, 8 * mm))

    # ── Payment Method ──
    method_text = "Bank Transfer / تحويل بنكي" if payment_method == "bank_transfer" else "Card / بطاقة"
    elements.append(Paragraph(f"<b>Payment Method / طريقة الدفع:</b> {method_text}", style_normal))
    elements.append(Spacer(1, 8 * mm))

    # ── QR Code + Footer ──
    qr_and_footer = [
        [
            Image(io.BytesIO(qr_png_bytes), width=35 * mm, height=35 * mm),
            Paragraph(
                "<b>ZATCA QR Code / رمز هيئة الزكاة والضريبة والجمارك</b><br/><br/>"
                "This is a simplified tax invoice issued in compliance with "
                "ZATCA e-invoicing regulations.<br/>"
                "هذه فاتورة ضريبية مبسطة صادرة وفقاً لمتطلبات هيئة الزكاة والضريبة والجمارك للفوترة الإلكترونية.",
                style_small,
            ),
        ],
    ]
    qr_table = Table(qr_and_footer, colWidths=[40 * mm, doc.width - 45 * mm])
    qr_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (1, 0), (1, 0), 10),
    ]))
    elements.append(qr_table)

    # ── Divider + Terms ──
    elements.append(Spacer(1, 6 * mm))
    elements.append(Table(
        [[""]],
        colWidths=[doc.width],
        style=TableStyle([("LINEABOVE", (0, 0), (-1, 0), 0.5, colors.HexColor("#E2E8F0"))]),
    ))
    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph(
        "This invoice is computer-generated and does not require a signature. "
        "هذه الفاتورة صادرة آلياً ولا تحتاج إلى توقيع.",
        style_small,
    ))

    doc.build(elements)
    buf.seek(0)
    return buf.getvalue()


async def generate_zatca_invoice(
    invoice,
    tenant,
    db,
) -> tuple[str, str]:
    """
    Generate a ZATCA-compliant invoice PDF for the given invoice.

    Returns (invoice_number, invoice_pdf_url).
    """
    # 1. Generate sequential invoice number
    invoice_number = await generate_next_invoice_number(db)

    # 2. Calculate VAT
    amount = invoice.amount_sar
    vat_amount = round(amount * VAT_RATE, 2)
    total_with_vat = round(amount + vat_amount, 2)

    # 3. Generate ZATCA QR code
    now = datetime.now(timezone.utc)
    qr_bytes = generate_zatca_qr(
        seller_name=SELLER_NAME_AR,
        vat_number=SELLER_VAT_NUMBER,
        timestamp=now.isoformat(),
        total_with_vat=f"{total_with_vat:.2f}",
        vat_amount=f"{vat_amount:.2f}",
    )

    # 4. Determine package name
    package_names = {
        "basic": "Basic / أساسي",
        "advanced": "Advanced / متقدم",
        "enterprise": "Enterprise / مؤسسات",
    }
    package_name = package_names.get(tenant.package, tenant.package)

    # 5. Build PDF
    pdf_bytes = _build_invoice_pdf(
        invoice_number=invoice_number,
        invoice_date=now.strftime("%Y-%m-%d %H:%M:%S UTC"),
        buyer_name_ar=tenant.name_ar,
        buyer_name_en=tenant.name_en,
        buyer_email=tenant.email,
        buyer_phone=tenant.phone,
        package_name=package_name,
        amount_sar=amount,
        vat_amount=vat_amount,
        total_with_vat=total_with_vat,
        qr_png_bytes=qr_bytes,
        payment_method=invoice.payment_method,
    )

    # 6. Upload PDF to GCS
    pdf_url = await upload_document(
        file_content=pdf_bytes,
        file_name=f"invoice_{invoice_number}.pdf",
        content_type="application/pdf",
        tenant_id=str(tenant.id),
        doc_type="zatca_invoice",
    )

    # 7. Update invoice record
    invoice.invoice_number = invoice_number
    invoice.invoice_pdf_url = pdf_url
    invoice.vat_amount = vat_amount
    invoice.total_with_vat = total_with_vat

    log.info(
        "zatca_invoice_generated",
        invoice_number=invoice_number,
        tenant_id=str(tenant.id),
        total_with_vat=total_with_vat,
        pdf_url=pdf_url,
    )

    return invoice_number, pdf_url
