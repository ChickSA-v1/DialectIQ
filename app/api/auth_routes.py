"""
Auth endpoints: register, login, upload documents, profile, place-id confirmation.
"""

import uuid

import structlog
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user, require_owner
from app.models import Document, Invoice, Tenant, User
from app.schemas import (
    InvoiceInfo,
    ConfirmPlaceIdRequest,
    ConfirmPlaceIdResponse,
    DocumentUploadResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    TenantInfo,
    UserProfile,
)
from app.security import create_access_token, hash_password, verify_password
from app.services.storage import upload_document

log = structlog.get_logger()
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# Package limits mapping
PACKAGE_LIMITS = {
    "basic": {"max_businesses": 1, "max_reviews_per_month": 500},
    "advanced": {"max_businesses": 5, "max_reviews_per_month": 2000},
    "enterprise": {"max_businesses": 999, "max_reviews_per_month": 999999},
}

ALLOWED_EXTENSIONS = {"pdf", "jpg", "jpeg", "png"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


# ── Register ───────────────────────────────────────────────────────────
@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new business + owner account."""

    # Check email uniqueness
    existing = await db.execute(select(User).where(User.email == req.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    limits = PACKAGE_LIMITS.get(req.package, PACKAGE_LIMITS["basic"])

    # Create Tenant
    tenant = Tenant(
        name_ar=req.business_name_ar,
        name_en=req.business_name_en,
        email=req.email,
        phone=req.phone,
        status="pending_review",
        package=req.package,
        place_ids=[],
        max_businesses=limits["max_businesses"],
        max_reviews_per_month=limits["max_reviews_per_month"],
    )
    db.add(tenant)
    await db.flush()

    # Create User (owner)
    user = User(
        tenant_id=tenant.id,
        email=req.email,
        password_hash=hash_password(req.password),
        full_name=req.full_name,
        role="owner",
        is_active=False,
    )
    db.add(user)
    await db.commit()

    log.info("tenant_registered", tenant_id=str(tenant.id), email=req.email, package=req.package)
    return RegisterResponse(
        tenant_id=tenant.id,
        message="Registration submitted. Please upload required documents.",
    )


# ── Upload document ────────────────────────────────────────────────────
@router.post("/upload-document", response_model=DocumentUploadResponse)
async def upload_doc(
    tenant_id: str = Form(...),
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a legal document (commercial_registration or owner_id)."""

    # Validate doc_type
    if doc_type not in ("commercial_registration", "owner_id"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "doc_type must be commercial_registration or owner_id")

    # Validate tenant exists and is pending
    result = await db.execute(select(Tenant).where(Tenant.id == uuid.UUID(tenant_id)))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    if tenant.status not in ("pending_review",):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Documents can only be uploaded during registration")

    # Validate file type and size
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"Allowed file types: {', '.join(ALLOWED_EXTENSIONS)}")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "File size exceeds 10 MB")

    # Upload to GCS
    file_url = await upload_document(
        file_content=content,
        file_name=file.filename or "document",
        content_type=file.content_type or "application/octet-stream",
        tenant_id=tenant_id,
        doc_type=doc_type,
    )

    # Save record
    doc = Document(
        tenant_id=tenant.id,
        doc_type=doc_type,
        file_url=file_url,
        file_name=file.filename or "document",
    )
    db.add(doc)
    await db.commit()

    log.info("document_uploaded", tenant_id=tenant_id, doc_type=doc_type)
    return DocumentUploadResponse(
        document_id=doc.id,
        file_name=doc.file_name,
        doc_type=doc.doc_type,
        file_url=doc.file_url,
    )


# ── Login ──────────────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate and return JWT."""
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    # Get tenant status
    tenant_status = None
    tenant_id = None
    if user.tenant_id:
        t_result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
        tenant = t_result.scalar_one_or_none()
        if tenant:
            tenant_status = tenant.status
            tenant_id = tenant.id

    token = create_access_token({"sub": str(user.id), "role": user.role})
    log.info("user_login", user_id=str(user.id), role=user.role)

    return LoginResponse(
        access_token=token,
        role=user.role,
        tenant_id=tenant_id,
        tenant_status=tenant_status,
    )


# ── Profile ────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserProfile)
async def get_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user profile with tenant info and invoices."""
    tenant_info = None
    invoices_list = None
    if user.tenant_id:
        result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
        tenant = result.scalar_one_or_none()
        if tenant:
            # Get latest invoice status
            inv_r = await db.execute(
                select(Invoice)
                .where(Invoice.tenant_id == tenant.id)
                .order_by(Invoice.created_at.desc())
            )
            invoices = inv_r.scalars().all()
            latest_invoice_status = invoices[0].status if invoices else None

            tenant_info = TenantInfo(
                id=tenant.id,
                name_ar=tenant.name_ar,
                name_en=tenant.name_en,
                email=tenant.email,
                phone=tenant.phone,
                status=tenant.status,
                package=tenant.package,
                place_ids=tenant.place_ids or [],
                max_businesses=tenant.max_businesses,
                max_reviews_per_month=tenant.max_reviews_per_month,
                reviews_used_this_month=tenant.reviews_used_this_month,
                api_key=tenant.api_key,
                rejection_reason=tenant.rejection_reason,
                latest_invoice_status=latest_invoice_status,
                created_at=tenant.created_at,
            )

            invoices_list = [
                InvoiceInfo(
                    id=inv.id,
                    amount_sar=inv.amount_sar,
                    status=inv.status,
                    hyperpay_checkout_id=inv.hyperpay_checkout_id,
                    paid_at=inv.paid_at,
                    created_at=inv.created_at,
                )
                for inv in invoices
            ]

    return UserProfile(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        tenant=tenant_info,
        invoices=invoices_list,
    )


# ── Confirm Place ID ──────────────────────────────────────────────────
place_router = APIRouter(prefix="/api/v1/tenant", tags=["tenant"])


@place_router.post("/confirm-place-id", response_model=ConfirmPlaceIdResponse)
async def confirm_place_id(
    req: ConfirmPlaceIdRequest,
    user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    """Confirm and add a Place ID to the tenant's list."""
    if not user.tenant_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No tenant associated")

    result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    # Validate place_id via Google Places API (optional, best-effort)
    place_name = None
    try:
        import httpx
        from app.config import get_settings
        settings = get_settings()
        if settings.api_key:  # reuse the Google API key if available
            pass  # Skip Google Places validation for now — will be added when Google API key is configured
    except Exception:
        pass  # Non-fatal — place ID validation is optional

    # Add to list
    current_places = tenant.place_ids or []
    if req.place_id in current_places:
        raise HTTPException(status.HTTP_409_CONFLICT, "Place ID already confirmed")

    # Check limit
    if len(current_places) >= tenant.max_businesses:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Maximum {tenant.max_businesses} businesses allowed for {tenant.package} package",
        )

    current_places.append(req.place_id)
    tenant.place_ids = current_places
    await db.commit()

    log.info("place_id_confirmed", tenant_id=str(tenant.id), place_id=req.place_id)
    return ConfirmPlaceIdResponse(
        place_id=req.place_id,
        place_name=place_name,
        message="Place ID confirmed successfully",
    )
