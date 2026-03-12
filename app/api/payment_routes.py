"""
Payment endpoints: checkout creation, HyperPay webhook, status check, result verification.
"""

import uuid
from datetime import datetime, timedelta, timezone

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user, require_owner
from app.models import Invoice, Subscription, Tenant, User
from app.schemas import CheckoutRequest, CheckoutResponse, PaymentStatusResponse
from app.security import generate_api_key
from app.services.hyperpay import create_checkout, get_payment_status

log = structlog.get_logger()
router = APIRouter(prefix="/api/v1/payments", tags=["payments"])


# ── Shared helper: activate tenant after payment ─────────────────────
async def _activate_tenant_after_payment(invoice: Invoice, db: AsyncSession) -> None:
    """
    After a successful payment, activate subscription + tenant + owner.
    Generates an API key if the tenant doesn't already have one.
    """
    # 1) Activate subscription
    sub_r = await db.execute(
        select(Subscription).where(Subscription.id == invoice.subscription_id)
    )
    sub = sub_r.scalar_one_or_none()
    if sub:
        sub.status = "active"
        sub.starts_at = datetime.now(timezone.utc)
        sub.expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    # 2) Activate tenant + generate API key
    t_r = await db.execute(
        select(Tenant).where(Tenant.id == invoice.tenant_id)
    )
    tenant = t_r.scalar_one_or_none()
    if tenant and tenant.status != "active":
        tenant.status = "active"
        if not tenant.api_key:
            tenant.api_key = generate_api_key()
        log.info(
            "tenant_auto_activated",
            tenant_id=str(tenant.id),
            api_key=tenant.api_key[:12] + "...",
        )

    # 3) Activate the owner user
    owner_r = await db.execute(
        select(User).where(User.tenant_id == invoice.tenant_id, User.role == "owner")
    )
    owner = owner_r.scalar_one_or_none()
    if owner:
        owner.is_active = True

    log.info("payment_activation_complete", invoice_id=str(invoice.id), tenant_id=str(invoice.tenant_id))


# ── Create checkout ────────────────────────────────────────────────────
@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(
    req: CheckoutRequest,
    user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    """Create a HyperPay checkout session for an invoice."""
    result = await db.execute(
        select(Invoice).where(Invoice.id == req.invoice_id, Invoice.tenant_id == user.tenant_id)
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invoice not found")
    if invoice.status == "paid":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invoice already paid")

    # Allow retry: if previous payment failed, reset to pending
    if invoice.status == "failed":
        invoice.status = "pending"
        invoice.hyperpay_checkout_id = None
        invoice.hyperpay_resource_path = None
        log.info("invoice_reset_for_retry", invoice_id=str(invoice.id))

    # Get tenant email
    t_result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
    tenant = t_result.scalar_one_or_none()

    from app.config import get_settings
    settings = get_settings()

    hp_result = await create_checkout(
        amount=invoice.amount_sar,
        currency="SAR",
        merchant_transaction_id=str(invoice.id),
        customer_email=tenant.email if tenant else user.email,
        shopper_result_url=f"{settings.dashboard_url}/client/payment-result",
    )

    checkout_id = hp_result.get("id")
    if not checkout_id:
        log.error("hyperpay_checkout_failed", result=hp_result)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Payment gateway error")

    # Save checkout_id
    invoice.hyperpay_checkout_id = checkout_id
    await db.commit()

    redirect_url = f"{settings.hyperpay_base_url}/v1/paymentWidgets.js?checkoutId={checkout_id}"

    return CheckoutResponse(
        checkout_id=checkout_id,
        redirect_url=redirect_url,
        is_mock=settings.hyperpay_mock,
    )


# ── HyperPay webhook / callback ───────────────────────────────────────
@router.post("/webhook")
async def payment_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    HyperPay sends a POST to this URL after payment completion.
    Query string includes `resourcePath`.
    """
    body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    resource_path = body.get("resourcePath") or request.query_params.get("resourcePath")

    if not resource_path:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Missing resourcePath")

    # Query HyperPay for the actual status
    hp_status = await get_payment_status(resource_path)
    is_success = hp_status.get("_is_success", False)
    merchant_tx_id = hp_status.get("merchantTransactionId", "")

    if not merchant_tx_id:
        log.warning("hyperpay_webhook_no_merchant_id", resource_path=resource_path)
        return {"status": "ignored"}

    # Find the invoice
    result = await db.execute(
        select(Invoice).where(Invoice.id == uuid.UUID(merchant_tx_id))
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        log.warning("hyperpay_webhook_invoice_not_found", merchant_tx_id=merchant_tx_id)
        return {"status": "not_found"}

    # Idempotency guard: skip if already processed
    if invoice.status in ("paid", "failed"):
        log.info("hyperpay_webhook_already_processed", invoice_id=str(invoice.id), status=invoice.status)
        return {"status": invoice.status}

    invoice.hyperpay_resource_path = resource_path

    if is_success:
        invoice.status = "paid"
        invoice.paid_at = datetime.now(timezone.utc)

        # Auto-activate tenant
        await _activate_tenant_after_payment(invoice, db)

        log.info("payment_success", invoice_id=str(invoice.id), tenant_id=str(invoice.tenant_id))
    else:
        invoice.status = "failed"
        log.warning("payment_failed", invoice_id=str(invoice.id), code=hp_status.get("result", {}).get("code"))

    await db.commit()
    return {"status": "paid" if is_success else "failed"}


# ── Payment result (called by frontend after HyperPay redirect) ──────
@router.get("/result", response_model=PaymentStatusResponse)
async def payment_result(
    id: str = Query(..., description="HyperPay checkout ID"),
    resourcePath: str = Query(..., description="HyperPay resource path"),
    db: AsyncSession = Depends(get_db),
):
    """
    Called by the frontend after HyperPay redirects the user back.
    Looks up the invoice by checkout_id, queries HyperPay for status,
    and processes the payment if not yet done.
    """
    # Find invoice by checkout_id
    result = await db.execute(
        select(Invoice).where(Invoice.hyperpay_checkout_id == id)
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invoice not found for this checkout")

    # If already processed, return current status
    if invoice.status in ("paid", "failed"):
        return PaymentStatusResponse(
            invoice_id=invoice.id,
            status=invoice.status,
            amount_sar=invoice.amount_sar,
            paid_at=invoice.paid_at,
        )

    # Query HyperPay for the actual status
    hp_status = await get_payment_status(resourcePath)
    is_success = hp_status.get("_is_success", False)

    invoice.hyperpay_resource_path = resourcePath

    if is_success:
        invoice.status = "paid"
        invoice.paid_at = datetime.now(timezone.utc)

        # Auto-activate tenant
        await _activate_tenant_after_payment(invoice, db)

        log.info("payment_result_success", invoice_id=str(invoice.id), tenant_id=str(invoice.tenant_id))
    else:
        invoice.status = "failed"
        log.warning("payment_result_failed", invoice_id=str(invoice.id), code=hp_status.get("result", {}).get("code"))

    await db.commit()

    return PaymentStatusResponse(
        invoice_id=invoice.id,
        status=invoice.status,
        amount_sar=invoice.amount_sar,
        paid_at=invoice.paid_at,
    )


# ── Payment status ─────────────────────────────────────────────────────
@router.get("/status/{invoice_id}", response_model=PaymentStatusResponse)
async def payment_status(
    invoice_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Check payment status for an invoice."""
    result = await db.execute(
        select(Invoice).where(Invoice.id == uuid.UUID(invoice_id))
    )
    invoice = result.scalar_one_or_none()
    if not invoice:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Invoice not found")

    # Only allow admin or the invoice's tenant owner
    if user.role != "admin" and user.tenant_id != invoice.tenant_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Access denied")

    return PaymentStatusResponse(
        invoice_id=invoice.id,
        status=invoice.status,
        amount_sar=invoice.amount_sar,
        paid_at=invoice.paid_at,
    )
