"""
Auth endpoints: register, login, upload documents, profile, place-id confirmation.
"""

import random
import uuid
from datetime import datetime, timedelta, timezone

import structlog
from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.models import Document, Invoice, Subscription, Tenant, User
from app.schemas import (
    DeleteAccountRequest,
    ForgotPasswordRequest,
    InvoiceInfo,
    ConfirmPlaceIdRequest,
    ConfirmPlaceIdResponse,
    DocumentUploadResponse,
    FetchReviewsResponse,
    LoginRequest,
    LoginResponse,
    PlaceSearchRequest,
    PlaceSearchResponse,
    PlaceSearchResult,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    TenantInfo,
    UserProfile,
    VerifyResetCodeRequest,
)
from app.security import create_access_token, generate_api_key, hash_password, verify_password
from app.services.places import (
    fetch_place_reviews,
    get_place_details,
    resolve_maps_url,
    search_places,
)
from app.services.email import send_new_registration_email, send_password_reset_email
from app.services.storage import upload_document

log = structlog.get_logger()
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# Package limits mapping
PACKAGE_LIMITS = {
    "basic": {"max_businesses": 1, "max_reviews_per_month": 500},
    "advanced": {"max_businesses": 5, "max_reviews_per_month": 2000},
    "enterprise": {"max_businesses": 999, "max_reviews_per_month": 999999},
}

# In-memory store for password reset codes: email -> (code, expires_at)
_reset_codes: dict[str, tuple[str, datetime]] = {}
RESET_CODE_TTL_MINUTES = 10

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

    # Create Tenant — auto-activate with 7-day free trial
    api_key = generate_api_key()
    now = datetime.now(timezone.utc)
    trial_end = now + timedelta(days=7)

    tenant = Tenant(
        name_ar=req.business_name_ar,
        name_en=req.business_name_en,
        email=req.email,
        phone=req.phone,
        status="active",
        package=req.package,
        place_ids=[],
        max_businesses=limits["max_businesses"],
        max_reviews_per_month=limits["max_reviews_per_month"],
        api_key=api_key,
    )
    db.add(tenant)
    await db.flush()

    # Create User (owner) — active immediately
    user = User(
        tenant_id=tenant.id,
        email=req.email,
        password_hash=hash_password(req.password),
        full_name=req.full_name,
        role="owner",
        is_active=True,
    )
    db.add(user)

    # Create 7-day trial subscription
    subscription = Subscription(
        tenant_id=tenant.id,
        package=req.package,
        status="active",
        starts_at=now,
        expires_at=trial_end,
    )
    db.add(subscription)

    await db.commit()

    log.info("tenant_registered_trial", tenant_id=str(tenant.id), email=req.email, package=req.package, trial_ends=trial_end.isoformat())

    # Send admin notification email (non-blocking, never fails registration)
    await send_new_registration_email(
        business_name_ar=req.business_name_ar,
        business_name_en=req.business_name_en or "",
        owner_name=req.full_name,
        email=req.email,
        phone=req.phone or "",
        package=req.package,
    )

    return RegisterResponse(
        tenant_id=tenant.id,
        message="Account activated! You have a 7-day free trial.",
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


# ── Forgot Password ───────────────────────────────────────────────────
@router.post("/forgot-password", status_code=200)
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Send a 6-digit reset code to the user's email."""
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if not user:
        log.info("forgot_password_unknown_email", email=req.email)
        return {"message": "If this email is registered, a reset code has been sent."}

    code = f"{random.randint(0, 999999):06d}"
    expires = datetime.now(timezone.utc) + timedelta(minutes=RESET_CODE_TTL_MINUTES)
    _reset_codes[req.email.lower()] = (code, expires)

    try:
        await send_password_reset_email(req.email, code)
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to send reset email. Please try again.")

    log.info("forgot_password_code_sent", email=req.email)
    return {"message": "If this email is registered, a reset code has been sent."}


@router.post("/verify-reset-code", status_code=200)
async def verify_reset_code(req: VerifyResetCodeRequest):
    """Verify that the reset code is correct (before showing new-password form)."""
    email = req.email.lower()
    entry = _reset_codes.get(email)

    if not entry:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No reset code found. Please request a new one.")

    code, expires = entry
    if datetime.now(timezone.utc) > expires:
        _reset_codes.pop(email, None)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Reset code has expired. Please request a new one.")

    if req.code != code:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid reset code.")

    return {"message": "Code verified successfully."}


@router.post("/reset-password", status_code=200)
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using email + verified code + new password."""
    email = req.email.lower()
    entry = _reset_codes.get(email)

    if not entry:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No reset code found. Please request a new one.")

    code, expires = entry
    if datetime.now(timezone.utc) > expires:
        _reset_codes.pop(email, None)
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Reset code has expired. Please request a new one.")

    if req.code != code:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid reset code.")

    # Update password
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found.")

    user.password_hash = hash_password(req.new_password)
    await db.commit()

    # Consume the code
    _reset_codes.pop(email, None)

    log.info("password_reset_success", email=req.email)
    return {"message": "Password has been reset successfully."}


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

            # Get active subscription dates
            from app.models import Subscription
            sub_r = await db.execute(
                select(Subscription)
                .where(Subscription.tenant_id == tenant.id, Subscription.status == "active")
                .order_by(Subscription.created_at.desc())
                .limit(1)
            )
            active_sub = sub_r.scalar_one_or_none()

            tenant_info = TenantInfo(
                id=tenant.id,
                name_ar=tenant.name_ar,
                name_en=tenant.name_en,
                email=tenant.email,
                phone=tenant.phone,
                status=tenant.status,
                package=tenant.package,
                place_ids=tenant.place_ids or [],
                pending_place_ids=tenant.pending_place_ids or [],
                max_businesses=tenant.max_businesses,
                max_reviews_per_month=tenant.max_reviews_per_month,
                reviews_used_this_month=tenant.reviews_used_this_month,
                api_key=tenant.api_key,
                rejection_reason=tenant.rejection_reason,
                latest_invoice_status=latest_invoice_status,
                card_payment_enabled=tenant.card_payment_enabled,
                subscription_starts_at=active_sub.starts_at if active_sub else None,
                subscription_expires_at=active_sub.expires_at if active_sub else None,
                created_at=tenant.created_at,
            )

            invoices_list = [
                InvoiceInfo(
                    id=inv.id,
                    amount_sar=inv.amount_sar,
                    status=inv.status,
                    hyperpay_checkout_id=inv.hyperpay_checkout_id,
                    payment_method=inv.payment_method,
                    transfer_receipt_url=inv.transfer_receipt_url,
                    transfer_receipt_name=inv.transfer_receipt_name,
                    invoice_number=inv.invoice_number,
                    invoice_pdf_url=inv.invoice_pdf_url,
                    vat_amount=inv.vat_amount,
                    total_with_vat=inv.total_with_vat,
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


# ── Delete Account ────────────────────────────────────────────────────
@router.delete("/me")
async def delete_account(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    body: DeleteAccountRequest | None = Body(default=None),
):
    """Delete the current user's account and all associated data."""
    # Delete the tenant (cascades to documents, subscriptions, invoices, users)
    if user.tenant_id:
        result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
        tenant = result.scalar_one_or_none()
        if tenant:
            await db.delete(tenant)
    else:
        # No tenant — just delete the user directly
        await db.delete(user)

    await db.commit()
    deletion_reason = body.reason if body else None
    log.info("account_deleted", user_id=str(user.id), email=user.email, deletion_reason=deletion_reason)
    return {"message": "Account deleted successfully"}


# ── Confirm Place ID ──────────────────────────────────────────────────
place_router = APIRouter(prefix="/api/v1/tenant", tags=["tenant"])


@place_router.post("/confirm-place-id", response_model=ConfirmPlaceIdResponse)
async def confirm_place_id(
    req: ConfirmPlaceIdRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a Place ID for admin approval (added to pending list)."""
    if not user.tenant_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No tenant associated")

    result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    # Validate place_id via Google Places API (optional, best-effort)
    place_name = None
    try:
        details = await get_place_details(req.place_id)
        if details:
            place_name = details.get("name")
    except Exception:
        pass  # Non-fatal — place ID validation is optional

    # Check if already confirmed
    current_places = list(tenant.place_ids or [])
    if req.place_id in current_places:
        raise HTTPException(status.HTTP_409_CONFLICT, "Place ID already confirmed")

    # Check if already pending
    pending_places = list(tenant.pending_place_ids or [])
    if req.place_id in pending_places:
        raise HTTPException(status.HTTP_409_CONFLICT, "Place ID already pending approval")

    # Check limit (confirmed + pending combined)
    total = len(current_places) + len(pending_places)
    if total >= tenant.max_businesses:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Maximum {tenant.max_businesses} businesses allowed for {tenant.package} package",
        )

    # Add to pending list — awaits admin approval
    from sqlalchemy.orm.attributes import flag_modified
    pending_places.append(req.place_id)
    tenant.pending_place_ids = pending_places
    flag_modified(tenant, "pending_place_ids")
    await db.commit()

    log.info("place_id_pending", tenant_id=str(tenant.id), place_id=req.place_id)
    return ConfirmPlaceIdResponse(
        place_id=req.place_id,
        place_name=place_name,
        message="Place ID submitted for admin approval",
    )


# ── Search Places ────────────────────────────────────────────────────

@place_router.post("/search-places", response_model=PlaceSearchResponse)
async def search_places_endpoint(
    req: PlaceSearchRequest,
    user: User = Depends(get_current_user),
):
    """Search for businesses by name or resolve a Google Maps URL."""
    query = req.query.strip()

    # Detect if input is a Google Maps URL
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

    # Text search
    raw_results = await search_places(query)
    results = [PlaceSearchResult(**r) for r in raw_results]
    return PlaceSearchResponse(results=results, query=query, source="text_search")


# ── Fetch Reviews On-Demand ──────────────────────────────────────────

@place_router.post("/fetch-reviews", response_model=list[FetchReviewsResponse])
async def fetch_reviews_endpoint(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch Google Maps reviews for all of the tenant's confirmed place IDs.
    Deduplicates against existing reviews, runs sentiment analysis + auto-reply.
    """
    import uuid as _uuid

    from app.models import AnalysisResult, Review
    from app.services.sentiment import analyze_reviews
    from app.services.reply import generate_reply

    if not user.tenant_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No tenant associated")

    result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")
    if tenant.status != "active":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Tenant is not active")

    place_ids = tenant.place_ids or []
    if not place_ids:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No Place IDs configured")

    # Resolve any URLs to proper Place IDs
    resolved_place_ids = []
    for pid in place_ids:
        if "goo.gl" in pid or "google.com" in pid or "maps.app" in pid:
            resolved = await resolve_maps_url(pid)
            if resolved and resolved.get("place_id"):
                real_pid = resolved["place_id"]
                resolved_place_ids.append(real_pid)
                # Update tenant's stored place_id if it was a URL
                if pid in (tenant.place_ids or []):
                    updated = [real_pid if p == pid else p for p in tenant.place_ids]
                    tenant.place_ids = updated
                    from sqlalchemy.orm.attributes import flag_modified
                    flag_modified(tenant, "place_ids")
                    log.info("place_id_resolved", old=pid, new=real_pid)
            else:
                log.warning("place_id_url_unresolved", url=pid)
        else:
            resolved_place_ids.append(pid)

    responses = []

    for place_id in resolved_place_ids:
        # Fetch reviews from Google
        raw_reviews = await fetch_place_reviews(place_id)
        if not raw_reviews:
            responses.append(FetchReviewsResponse(
                place_id=place_id,
                business_name="Unknown",
                reviews_fetched=0,
                reviews_new=0,
                reviews_analyzed=0,
                message="No reviews found on Google Maps",
            ))
            continue

        business_name = raw_reviews[0]["business_name"]

        # Deduplicate: check which reviews we already have
        # Compare against both original text AND translated text
        # (old reviews may have been stored as English translations)
        existing = await db.execute(
            select(Review.raw_text).where(
                Review.tenant_uuid == tenant.id,
                Review.place_id == place_id,
            )
        )
        existing_texts = {row[0] for row in existing.fetchall()}

        new_reviews = [
            r for r in raw_reviews
            if r["text"] not in existing_texts
            and r.get("translated_text", r["text"]) not in existing_texts
        ]
        analyzed_count = 0

        for rev in new_reviews:
            # Check quota
            if tenant.reviews_used_this_month >= tenant.max_reviews_per_month:
                log.warning("quota_exceeded_during_fetch", tenant_id=str(tenant.id))
                break

            # Persist raw review
            review_row = Review(
                id=_uuid.uuid4(),
                business_name=rev["business_name"],
                place_id=place_id,
                source="google_maps",
                author=rev["author_name"],
                raw_text=rev["text"],
                rating=rev["rating"],
                tenant_id=str(tenant.id),
                tenant_uuid=tenant.id,
            )
            db.add(review_row)
            await db.flush()

            # Sentiment analysis
            try:
                analyses, latency = await analyze_reviews([rev["text"]])
                sentiment = analyses[0]
            except Exception as e:
                log.error("fetch_review_analysis_failed", error=str(e))
                continue

            # Auto-reply
            suggested_reply = None
            try:
                suggested_reply, _ = await generate_reply(
                    review_text=rev["text"],
                    sentiment_score=sentiment.sentiment_score,
                    category=sentiment.category,
                    urgency_level=sentiment.urgency_level,
                    dialect_detected=sentiment.dialect_detected,
                    translated_intent=sentiment.translated_intent,
                    author_name=rev["author_name"],
                    business_name=rev["business_name"],
                )
            except Exception:
                pass

            # Persist analysis
            analysis_row = AnalysisResult(
                review_id=review_row.id,
                sentiment_score=sentiment.sentiment_score,
                category=sentiment.category,
                urgency_level=sentiment.urgency_level,
                dialect_detected=sentiment.dialect_detected,
                translated_intent=sentiment.translated_intent,
                suggested_reply=suggested_reply,
                model_version="gpt-4o",
                latency_ms=latency,
            )
            db.add(analysis_row)
            tenant.reviews_used_this_month += 1
            analyzed_count += 1

        await db.commit()

        responses.append(FetchReviewsResponse(
            place_id=place_id,
            business_name=business_name,
            reviews_fetched=len(raw_reviews),
            reviews_new=len(new_reviews),
            reviews_analyzed=analyzed_count,
            message=f"Fetched {len(raw_reviews)} reviews, {analyzed_count} new analyzed",
        ))

    return responses


# ── Competitor Tracking ──────────────────────────────────────────────


@place_router.post("/add-competitor")
async def add_competitor(
    req: ConfirmPlaceIdRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a competitor's Google Place ID for comparison tracking."""
    if not user.tenant_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No tenant associated")

    result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    competitors = list(tenant.competitor_place_ids or [])
    if req.place_id in competitors:
        raise HTTPException(status.HTTP_409_CONFLICT, "Competitor already added")

    # Max 3 competitors
    if len(competitors) >= 3:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Maximum 3 competitors allowed")

    # Check it's not one of their own places
    own_places = list(tenant.place_ids or [])
    if req.place_id in own_places:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot add your own business as competitor")

    # Get competitor name
    place_name = None
    try:
        details = await get_place_details(req.place_id)
        if details:
            place_name = details.get("name")
    except Exception:
        pass

    from sqlalchemy.orm.attributes import flag_modified
    competitors.append(req.place_id)
    tenant.competitor_place_ids = competitors
    flag_modified(tenant, "competitor_place_ids")
    await db.commit()

    log.info("competitor_added", tenant_id=str(tenant.id), place_id=req.place_id)
    return {
        "place_id": req.place_id,
        "place_name": place_name,
        "message": "Competitor added successfully",
        "total_competitors": len(competitors),
    }


@place_router.delete("/remove-competitor/{place_id}")
async def remove_competitor(
    place_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a competitor from tracking."""
    if not user.tenant_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No tenant associated")

    result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    competitors = list(tenant.competitor_place_ids or [])
    if place_id not in competitors:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Competitor not found")

    from sqlalchemy.orm.attributes import flag_modified
    competitors.remove(place_id)
    tenant.competitor_place_ids = competitors
    flag_modified(tenant, "competitor_place_ids")
    await db.commit()

    return {"message": "Competitor removed", "place_id": place_id}


@place_router.get("/competitor-comparison")
async def competitor_comparison(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Compare own businesses vs competitors using Google Places data.
    Returns ratings, review counts, and trends for both sides.
    """
    if not user.tenant_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No tenant associated")

    result = await db.execute(select(Tenant).where(Tenant.id == user.tenant_id))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    own_places = list(tenant.place_ids or [])
    competitor_places = list(tenant.competitor_place_ids or [])

    async def _get_place_info(pid: str) -> dict | None:
        try:
            details = await get_place_details(pid)
            if details:
                return {
                    "place_id": pid,
                    "name": details.get("name", "Unknown"),
                    "rating": details.get("rating"),
                    "review_count": details.get("userRatingCount"),
                }
        except Exception:
            pass
        return None

    from sqlalchemy import func as _func
    from app.models import AnalysisResult, Review

    own_data = []
    for pid in own_places:
        info = await _get_place_info(pid)
        if info:
            # Enrich with our own sentiment data
            avg_q = (
                select(_func.avg(AnalysisResult.sentiment_score), _func.count(Review.id))
                .join(Review)
                .where(Review.tenant_uuid == tenant.id, Review.place_id == pid)
            )
            row = (await db.execute(avg_q)).one_or_none()
            info["avg_sentiment"] = round(float(row[0]), 2) if row and row[0] else None
            info["analyzed_reviews"] = row[1] if row else 0
            info["is_own"] = True
            own_data.append(info)

    competitor_data = []
    for pid in competitor_places:
        info = await _get_place_info(pid)
        if info:
            info["is_own"] = False
            competitor_data.append(info)

    return {
        "own": own_data,
        "competitors": competitor_data,
    }


# ── Team Management ─────────────────────────────────────────────────


@place_router.get("/team")
async def list_team_members(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all team members for the current tenant."""
    if not user.tenant_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No tenant associated")
    if user.role not in ("owner", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only owners can manage team")

    result = await db.execute(
        select(User).where(User.tenant_id == user.tenant_id).order_by(User.created_at)
    )
    members = result.scalars().all()
    return [
        {
            "id": str(m.id),
            "email": m.email,
            "full_name": m.full_name,
            "role": m.role,
            "is_active": m.is_active,
            "allowed_place_ids": m.allowed_place_ids,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in members
    ]


@place_router.post("/team/invite")
async def invite_team_member(
    req: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Invite a team member. Owner only."""
    if not user.tenant_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No tenant associated")
    if user.role not in ("owner", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only owners can invite members")

    email = req.get("email", "").strip().lower()
    full_name = req.get("full_name", "").strip()
    password = req.get("password", "").strip()
    allowed_place_ids = req.get("allowed_place_ids")  # list or None

    if not email or not full_name or not password:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "email, full_name, and password are required")

    # Check if email already exists
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    # Check team size limit (max 10 members per tenant)
    count_result = await db.execute(
        select(func.count(User.id)).where(User.tenant_id == user.tenant_id)
    )
    member_count = count_result.scalar() or 0
    if member_count >= 10:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Maximum 10 team members allowed")

    import hashlib
    password_hash = hashlib.sha256(password.encode()).hexdigest()

    new_member = User(
        id=uuid.uuid4(),
        tenant_id=user.tenant_id,
        email=email,
        password_hash=password_hash,
        full_name=full_name,
        role="member",
        is_active=True,
        allowed_place_ids=allowed_place_ids,
    )
    db.add(new_member)
    await db.commit()

    log.info("team_member_invited", tenant_id=str(user.tenant_id), email=email)
    return {
        "id": str(new_member.id),
        "email": email,
        "full_name": full_name,
        "role": "member",
        "message": "Team member added successfully",
    }


@place_router.delete("/team/{member_id}")
async def remove_team_member(
    member_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a team member. Owner only."""
    if user.role not in ("owner", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only owners can remove members")

    mid = uuid.UUID(member_id)
    result = await db.execute(
        select(User).where(User.id == mid, User.tenant_id == user.tenant_id)
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")

    if member.role == "owner":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cannot remove the owner")

    await db.delete(member)
    await db.commit()

    log.info("team_member_removed", tenant_id=str(user.tenant_id), member_id=member_id)
    return {"message": "Member removed", "id": member_id}
