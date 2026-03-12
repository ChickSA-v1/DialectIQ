"""
Admin endpoints: manage registrations, tenants, and activations.
"""

import math

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import require_admin
from app.models import Document, Invoice, Subscription, Tenant, User
from app.schemas import (
    DocumentInfo,
    InvoiceInfo,
    RegistrationDetail,
    RegistrationListResponse,
    RejectRequest,
    SubscriptionInfo,
    TenantInfo,
    TenantListResponse,
    UserProfile,
)
from app.security import generate_api_key

log = structlog.get_logger()
router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

# Package pricing (SAR)
PACKAGE_PRICES = {
    "basic": 500.0,
    "advanced": 1500.0,
    "enterprise": 2500.0,
}


# ── List registrations (pending review) ────────────────────────────────
@router.get("/registrations", response_model=RegistrationListResponse)
async def list_registrations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all pending registration requests."""
    base_q = select(Tenant).where(Tenant.status == "pending_review")

    # Count
    count_q = select(func.count()).select_from(base_q.subquery())
    total = (await db.execute(count_q)).scalar() or 0
    total_pages = max(1, math.ceil(total / page_size))

    # Fetch tenants
    result = await db.execute(
        base_q.order_by(Tenant.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    tenants = result.scalars().all()

    registrations = []
    for t in tenants:
        # Get documents
        docs_r = await db.execute(select(Document).where(Document.tenant_id == t.id))
        docs = docs_r.scalars().all()

        # Get owner
        owner_r = await db.execute(
            select(User).where(User.tenant_id == t.id, User.role == "owner")
        )
        owner = owner_r.scalar_one_or_none()

        registrations.append(
            RegistrationDetail(
                tenant=TenantInfo(
                    id=t.id, name_ar=t.name_ar, name_en=t.name_en,
                    email=t.email, phone=t.phone, status=t.status,
                    package=t.package, place_ids=t.place_ids or [],
                    max_businesses=t.max_businesses,
                    max_reviews_per_month=t.max_reviews_per_month,
                    reviews_used_this_month=t.reviews_used_this_month,
                    api_key=t.api_key, created_at=t.created_at,
                ),
                documents=[
                    DocumentInfo(
                        id=d.id, doc_type=d.doc_type,
                        file_name=d.file_name, file_url=d.file_url,
                        uploaded_at=d.uploaded_at,
                    )
                    for d in docs
                ],
                owner=UserProfile(
                    id=owner.id, email=owner.email,
                    full_name=owner.full_name, role=owner.role,
                    is_active=owner.is_active,
                ) if owner else None,
            )
        )

    return RegistrationListResponse(
        registrations=registrations,
        total=total, page=page, total_pages=total_pages,
    )


# ── Registration detail ───────────────────────────────────────────────
@router.get("/registrations/{tenant_id}")
async def get_registration(
    tenant_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get full detail for a registration."""
    import uuid as _uuid
    result = await db.execute(select(Tenant).where(Tenant.id == _uuid.UUID(tenant_id)))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    docs_r = await db.execute(select(Document).where(Document.tenant_id == tenant.id))
    docs = docs_r.scalars().all()

    owner_r = await db.execute(
        select(User).where(User.tenant_id == tenant.id, User.role == "owner")
    )
    owner = owner_r.scalar_one_or_none()

    # Get subscription & invoices if any
    sub_r = await db.execute(select(Subscription).where(Subscription.tenant_id == tenant.id))
    subs = sub_r.scalars().all()

    inv_r = await db.execute(select(Invoice).where(Invoice.tenant_id == tenant.id))
    invoices = inv_r.scalars().all()

    return {
        "tenant": TenantInfo(
            id=tenant.id, name_ar=tenant.name_ar, name_en=tenant.name_en,
            email=tenant.email, phone=tenant.phone, status=tenant.status,
            package=tenant.package, place_ids=tenant.place_ids or [],
            max_businesses=tenant.max_businesses,
            max_reviews_per_month=tenant.max_reviews_per_month,
            reviews_used_this_month=tenant.reviews_used_this_month,
            api_key=tenant.api_key, created_at=tenant.created_at,
        ),
        "documents": [
            DocumentInfo(
                id=d.id, doc_type=d.doc_type,
                file_name=d.file_name, file_url=d.file_url,
                uploaded_at=d.uploaded_at,
            ) for d in docs
        ],
        "owner": UserProfile(
            id=owner.id, email=owner.email,
            full_name=owner.full_name, role=owner.role,
            is_active=owner.is_active,
        ) if owner else None,
        "subscriptions": [
            SubscriptionInfo(
                id=s.id, package=s.package, status=s.status,
                starts_at=s.starts_at, expires_at=s.expires_at,
                created_at=s.created_at,
            ) for s in subs
        ],
        "invoices": [
            InvoiceInfo(
                id=i.id, amount_sar=i.amount_sar, status=i.status,
                hyperpay_checkout_id=i.hyperpay_checkout_id,
                paid_at=i.paid_at, created_at=i.created_at,
            ) for i in invoices
        ],
    }


# ── Approve registration ──────────────────────────────────────────────
@router.post("/registrations/{tenant_id}/approve")
async def approve_registration(
    tenant_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Approve a registration: creates subscription + invoice."""
    import uuid as _uuid
    result = await db.execute(select(Tenant).where(Tenant.id == _uuid.UUID(tenant_id)))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    if tenant.status != "pending_review":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Cannot approve tenant with status: {tenant.status}")

    # Update status
    tenant.status = "approved"

    # Create subscription
    sub = Subscription(
        tenant_id=tenant.id,
        package=tenant.package,
        status="pending_payment",
    )
    db.add(sub)
    await db.flush()

    # Create invoice
    amount = PACKAGE_PRICES.get(tenant.package, 500.0)
    invoice = Invoice(
        tenant_id=tenant.id,
        subscription_id=sub.id,
        amount_sar=amount,
        status="pending",
    )
    db.add(invoice)
    await db.commit()

    log.info("registration_approved", tenant_id=tenant_id, package=tenant.package, amount=amount)
    return {
        "message": "Registration approved. Invoice created.",
        "invoice_id": str(invoice.id),
        "amount_sar": amount,
        "subscription_id": str(sub.id),
    }


# ── Reject registration ───────────────────────────────────────────────
@router.post("/registrations/{tenant_id}/reject")
async def reject_registration(
    tenant_id: str,
    req: RejectRequest,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Reject a registration with reason."""
    import uuid as _uuid
    result = await db.execute(select(Tenant).where(Tenant.id == _uuid.UUID(tenant_id)))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    if tenant.status != "pending_review":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Cannot reject tenant with status: {tenant.status}")

    tenant.status = "rejected"
    tenant.rejection_reason = req.reason
    await db.commit()

    log.info("registration_rejected", tenant_id=tenant_id, reason=req.reason)
    return {"message": "Registration rejected", "reason": req.reason}


# ── List all tenants ───────────────────────────────────────────────────
@router.get("/tenants", response_model=TenantListResponse)
async def list_tenants(
    status_filter: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all tenants with optional status filter."""
    base_q = select(Tenant)
    if status_filter:
        base_q = base_q.where(Tenant.status == status_filter)

    count_q = select(func.count()).select_from(base_q.subquery())
    total = (await db.execute(count_q)).scalar() or 0
    total_pages = max(1, math.ceil(total / page_size))

    result = await db.execute(
        base_q.order_by(Tenant.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    tenants = result.scalars().all()

    return TenantListResponse(
        tenants=[
            TenantInfo(
                id=t.id, name_ar=t.name_ar, name_en=t.name_en,
                email=t.email, phone=t.phone, status=t.status,
                package=t.package, place_ids=t.place_ids or [],
                max_businesses=t.max_businesses,
                max_reviews_per_month=t.max_reviews_per_month,
                reviews_used_this_month=t.reviews_used_this_month,
                api_key=t.api_key, created_at=t.created_at,
            )
            for t in tenants
        ],
        total=total, page=page, total_pages=total_pages,
    )


# ── Activate tenant ───────────────────────────────────────────────────
@router.post("/tenants/{tenant_id}/activate")
async def activate_tenant(
    tenant_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Final activation: generate API key, enable user, set tenant active."""
    import uuid as _uuid
    result = await db.execute(select(Tenant).where(Tenant.id == _uuid.UUID(tenant_id)))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    if tenant.status == "active":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Tenant is already active")

    # Check that payment is done
    inv_r = await db.execute(
        select(Invoice).where(
            Invoice.tenant_id == tenant.id,
            Invoice.status == "paid",
        )
    )
    paid_invoice = inv_r.scalar_one_or_none()
    if not paid_invoice:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No paid invoice found. Payment required before activation.")

    # Generate API key
    api_key = generate_api_key()
    tenant.api_key = api_key
    tenant.status = "active"

    # Activate the owner user
    owner_r = await db.execute(
        select(User).where(User.tenant_id == tenant.id, User.role == "owner")
    )
    owner = owner_r.scalar_one_or_none()
    if owner:
        owner.is_active = True

    await db.commit()

    log.info("tenant_activated", tenant_id=tenant_id, api_key=api_key[:12] + "...")
    return {
        "message": "Tenant activated successfully",
        "api_key": api_key,
        "tenant_id": tenant_id,
        "status": "active",
    }
