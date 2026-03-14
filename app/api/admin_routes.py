"""
Admin endpoints: manage registrations, tenants, and activations.
"""

import math
import uuid as _uuid

import structlog
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import Response
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import require_admin
from app.models import Document, Invoice, Subscription, Tenant, User
from app.schemas import (
    ConfirmPlaceIdRequest,
    DocumentInfo,
    EditTenantRequest,
    InvoiceInfo,
    PlaceSearchRequest,
    PlaceSearchResponse,
    PlaceSearchResult,
    RegistrationDetail,
    RegistrationListResponse,
    RejectRequest,
    SubscriptionInfo,
    TenantInfo,
    TenantListResponse,
    UserProfile,
)
from app.security import generate_api_key
from app.services.places import get_place_details, resolve_maps_url, search_places
from app.services.storage import download_blob

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
                    pending_place_ids=t.pending_place_ids or [],
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
            pending_place_ids=tenant.pending_place_ids or [],
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
                payment_method=i.payment_method,
                transfer_receipt_url=i.transfer_receipt_url,
                transfer_receipt_name=i.transfer_receipt_name,
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

    # Build tenant list with latest invoice status
    tenant_list = []
    for t in tenants:
        # Get latest invoice status for this tenant
        inv_r = await db.execute(
            select(Invoice)
            .where(Invoice.tenant_id == t.id)
            .order_by(Invoice.created_at.desc())
            .limit(1)
        )
        latest_inv = inv_r.scalar_one_or_none()

        tenant_list.append(
            TenantInfo(
                id=t.id, name_ar=t.name_ar, name_en=t.name_en,
                email=t.email, phone=t.phone, status=t.status,
                package=t.package, place_ids=t.place_ids or [],
                pending_place_ids=t.pending_place_ids or [],
                max_businesses=t.max_businesses,
                max_reviews_per_month=t.max_reviews_per_month,
                reviews_used_this_month=t.reviews_used_this_month,
                api_key=t.api_key,
                rejection_reason=t.rejection_reason,
                latest_invoice_status=latest_inv.status if latest_inv else None,
                created_at=t.created_at,
            )
        )

    return TenantListResponse(
        tenants=tenant_list,
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


# ── Edit tenant ──────────────────────────────────────────────────────
PACKAGE_LIMITS = {
    "basic": {"max_businesses": 1, "max_reviews_per_month": 500},
    "advanced": {"max_businesses": 5, "max_reviews_per_month": 2000},
    "enterprise": {"max_businesses": 999, "max_reviews_per_month": 999999},
}


@router.put("/tenants/{tenant_id}")
async def edit_tenant(
    tenant_id: str,
    req: EditTenantRequest,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Edit tenant details (name, email, phone, package)."""
    result = await db.execute(select(Tenant).where(Tenant.id == _uuid.UUID(tenant_id)))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    updated_fields = []
    if req.name_ar is not None:
        tenant.name_ar = req.name_ar
        updated_fields.append("name_ar")
    if req.name_en is not None:
        tenant.name_en = req.name_en
        updated_fields.append("name_en")
    if req.email is not None:
        tenant.email = req.email
        updated_fields.append("email")
    if req.phone is not None:
        tenant.phone = req.phone
        updated_fields.append("phone")
    if req.package is not None and req.package != tenant.package:
        tenant.package = req.package
        limits = PACKAGE_LIMITS.get(req.package, PACKAGE_LIMITS["basic"])
        tenant.max_businesses = limits["max_businesses"]
        tenant.max_reviews_per_month = limits["max_reviews_per_month"]
        updated_fields.append("package")

    await db.commit()
    log.info("tenant_edited", tenant_id=tenant_id, fields=updated_fields)
    return {"message": "Tenant updated successfully", "updated_fields": updated_fields}


# ── Deactivate tenant ────────────────────────────────────────────────
@router.post("/tenants/{tenant_id}/deactivate")
async def deactivate_tenant(
    tenant_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate an active tenant: revoke API key, disable owner."""
    result = await db.execute(select(Tenant).where(Tenant.id == _uuid.UUID(tenant_id)))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    if tenant.status != "active":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Cannot deactivate tenant with status: {tenant.status}")

    tenant.status = "suspended"
    tenant.api_key = None

    # Disable the owner user
    owner_r = await db.execute(
        select(User).where(User.tenant_id == tenant.id, User.role == "owner")
    )
    owner = owner_r.scalar_one_or_none()
    if owner:
        owner.is_active = False

    await db.commit()
    log.info("tenant_deactivated", tenant_id=tenant_id)
    return {"message": "Tenant deactivated", "tenant_id": tenant_id, "status": "suspended"}


# ── Reactivate tenant ────────────────────────────────────────────────
@router.post("/tenants/{tenant_id}/reactivate")
async def reactivate_tenant(
    tenant_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Reactivate a suspended tenant: generate new API key, enable owner."""
    result = await db.execute(select(Tenant).where(Tenant.id == _uuid.UUID(tenant_id)))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    if tenant.status != "suspended":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Cannot reactivate tenant with status: {tenant.status}")

    tenant.status = "active"
    tenant.api_key = generate_api_key()

    # Re-enable the owner user
    owner_r = await db.execute(
        select(User).where(User.tenant_id == tenant.id, User.role == "owner")
    )
    owner = owner_r.scalar_one_or_none()
    if owner:
        owner.is_active = True

    await db.commit()
    log.info("tenant_reactivated", tenant_id=tenant_id, api_key=tenant.api_key[:12] + "...")
    return {
        "message": "Tenant reactivated",
        "api_key": tenant.api_key,
        "tenant_id": tenant_id,
        "status": "active",
    }


# ── Document proxy (secure access) ──────────────────────────────────
@router.get("/documents/{document_id}/view")
async def view_document(
    document_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Proxy-serve a document from GCS. Admin-only.
    The browser receives the file content directly — no public GCS access needed.
    """
    result = await db.execute(
        select(Document).where(Document.id == _uuid.UUID(document_id))
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Document not found")

    try:
        content, content_type = download_blob(doc.file_url)
    except Exception as e:
        log.error("document_download_failed", document_id=document_id, error=str(e))
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Failed to retrieve document from storage")

    # RFC 5987 encoding for non-ASCII filenames
    from urllib.parse import quote
    filename_encoded = quote(doc.file_name)

    return Response(
        content=content,
        media_type=content_type,
        headers={
            "Content-Disposition": f"inline; filename*=UTF-8''{filename_encoded}",
            "Cache-Control": "private, max-age=300",
        },
    )


# ── Place ID Management (Admin) ─────────────────────────────────────


@router.post("/tenants/{tenant_id}/search-places", response_model=PlaceSearchResponse)
async def admin_search_places(
    tenant_id: str,
    req: PlaceSearchRequest,
    _admin: User = Depends(require_admin),
):
    """Admin: search for businesses by name or resolve a Google Maps URL."""
    query = req.query.strip()

    is_url = any(s in query for s in ("google.com/maps", "goo.gl", "maps.app", "maps.google"))

    if is_url:
        resolved = await resolve_maps_url(query)
        if resolved:
            source = resolved.pop("source", "url_resolve")
            return PlaceSearchResponse(
                results=[PlaceSearchResult(**resolved)],
                query=query,
                source=source,
            )
        return PlaceSearchResponse(results=[], query=query, source="url_resolve")

    raw_results = await search_places(query)
    results = [PlaceSearchResult(**r) for r in raw_results]
    return PlaceSearchResponse(results=results, query=query, source="text_search")


@router.post("/tenants/{tenant_id}/place-ids")
async def admin_add_place_id(
    tenant_id: str,
    req: ConfirmPlaceIdRequest,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: add a Place ID to a tenant's list."""
    tid = _uuid.UUID(tenant_id)
    result = await db.execute(select(Tenant).where(Tenant.id == tid))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    current_places = list(tenant.place_ids or [])
    if req.place_id in current_places:
        raise HTTPException(status.HTTP_409_CONFLICT, "Place ID already added")

    if len(current_places) >= tenant.max_businesses:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Maximum {tenant.max_businesses} businesses for {tenant.package} package",
        )

    # Validate and get place name
    place_name = None
    try:
        details = await get_place_details(req.place_id)
        if details:
            place_name = details.get("name")
    except Exception:
        pass

    current_places.append(req.place_id)
    tenant.place_ids = current_places
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(tenant, "place_ids")
    await db.commit()

    log.info("admin_place_id_added", tenant_id=tenant_id, place_id=req.place_id)
    return {
        "message": "Place ID added",
        "place_id": req.place_id,
        "place_name": place_name,
        "total_places": len(current_places),
    }


@router.delete("/tenants/{tenant_id}/place-ids/{place_id}")
async def admin_remove_place_id(
    tenant_id: str,
    place_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: remove a Place ID from a tenant's list."""
    tid = _uuid.UUID(tenant_id)
    result = await db.execute(select(Tenant).where(Tenant.id == tid))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    current_places = list(tenant.place_ids or [])
    if place_id not in current_places:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Place ID not found in tenant")

    current_places.remove(place_id)
    tenant.place_ids = current_places
    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(tenant, "place_ids")
    await db.commit()

    log.info("admin_place_id_removed", tenant_id=tenant_id, place_id=place_id)
    return {"message": "Place ID removed", "place_id": place_id, "total_places": len(current_places)}


# ── Pending Place ID Approval ─────────────────────────────────────


@router.get("/pending-places")
async def list_pending_places(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all tenants that have pending place IDs awaiting approval."""
    result = await db.execute(select(Tenant).where(Tenant.pending_place_ids.isnot(None)))
    tenants = result.scalars().all()

    pending_list = []
    for t in tenants:
        pending = list(t.pending_place_ids or [])
        if not pending:
            continue
        pending_list.append({
            "tenant_id": str(t.id),
            "name_ar": t.name_ar,
            "name_en": t.name_en,
            "email": t.email,
            "package": t.package,
            "status": t.status,
            "pending_place_ids": pending,
            "confirmed_place_ids": list(t.place_ids or []),
            "max_businesses": t.max_businesses,
        })

    return {"pending": pending_list, "total": len(pending_list)}


@router.post("/tenants/{tenant_id}/pending-places/{place_id}/approve")
async def approve_pending_place(
    tenant_id: str,
    place_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: approve a pending place ID → move to confirmed list."""
    tid = _uuid.UUID(tenant_id)
    result = await db.execute(select(Tenant).where(Tenant.id == tid))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    pending = list(tenant.pending_place_ids or [])
    if place_id not in pending:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Place ID not in pending list")

    confirmed = list(tenant.place_ids or [])
    if place_id in confirmed:
        raise HTTPException(status.HTTP_409_CONFLICT, "Place ID already confirmed")

    if len(confirmed) >= tenant.max_businesses:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Maximum {tenant.max_businesses} businesses for {tenant.package} package",
        )

    # Move from pending → confirmed
    from sqlalchemy.orm.attributes import flag_modified
    pending.remove(place_id)
    confirmed.append(place_id)
    tenant.pending_place_ids = pending
    tenant.place_ids = confirmed
    flag_modified(tenant, "pending_place_ids")
    flag_modified(tenant, "place_ids")
    await db.commit()

    log.info("pending_place_approved", tenant_id=tenant_id, place_id=place_id)
    return {"message": "Place ID approved", "place_id": place_id}


@router.post("/tenants/{tenant_id}/pending-places/{place_id}/reject")
async def reject_pending_place(
    tenant_id: str,
    place_id: str,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: reject a pending place ID → remove from pending list."""
    tid = _uuid.UUID(tenant_id)
    result = await db.execute(select(Tenant).where(Tenant.id == tid))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    pending = list(tenant.pending_place_ids or [])
    if place_id not in pending:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Place ID not in pending list")

    from sqlalchemy.orm.attributes import flag_modified
    pending.remove(place_id)
    tenant.pending_place_ids = pending
    flag_modified(tenant, "pending_place_ids")
    await db.commit()

    log.info("pending_place_rejected", tenant_id=tenant_id, place_id=place_id)
    return {"message": "Place ID rejected", "place_id": place_id}
