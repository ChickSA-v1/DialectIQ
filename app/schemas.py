from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


# --- Request ---

class ReviewInput(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000, description="Raw review text (Arabic, Arabizi, or mixed)")
    source: str | None = Field(None, max_length=50, description="Origin platform")
    author: str | None = Field(None, max_length=255)


class AnalyzeRequest(BaseModel):
    tenant_id: str = Field(..., min_length=1, max_length=100)
    reviews: list[ReviewInput] = Field(..., min_length=1)


# --- Claude structured output ---

class SentimentOutput(BaseModel):
    sentiment_score: float = Field(..., ge=1, le=10)
    category: str
    urgency_level: str = Field(..., pattern=r"^(Low|Medium|High)$")
    dialect_detected: str
    translated_intent: str


# --- Response ---

class ReviewResult(BaseModel):
    review_id: UUID
    raw_text: str
    analysis: SentimentOutput


class AnalyzeResponse(BaseModel):
    tenant_id: str
    count: int
    results: list[ReviewResult]
    total_latency_ms: int


# --- Google Maps Webhook (n8n) ---

class GoogleReviewInput(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=255, description="Name of the business/institution")
    place_id: str = Field(..., min_length=1, max_length=255)
    text: str = Field(..., min_length=1, max_length=5000, description="Review text (may be Google-translated)")
    original_text: str | None = Field(None, max_length=5000, description="Original language text from Google originalText field")
    rating: int = Field(..., ge=1, le=5)
    author_name: str = Field(..., min_length=1, max_length=255)


class GoogleReviewResponse(BaseModel):
    status: str
    business_name: str
    place_id: str
    author_name: str
    rating: int
    text: str
    sentiment: SentimentOutput | None = None
    suggested_reply: str | None = None
    latency_ms: int | None = None


# --- Dashboard API ---

class ReviewDetail(BaseModel):
    id: UUID
    business_name: str
    place_id: str
    author: str | None
    raw_text: str
    rating: int | None
    source: str | None
    sentiment_score: float | None = None
    category: str | None = None
    urgency_level: str | None = None
    dialect_detected: str | None = None
    translated_intent: str | None = None
    suggested_reply: str | None = None
    created_at: datetime


class SentimentTrendPoint(BaseModel):
    date: str
    avg_sentiment: float
    count: int


class DashboardStats(BaseModel):
    total_reviews: int
    avg_sentiment: float | None
    avg_rating: float | None
    urgency_breakdown: dict[str, int]
    category_breakdown: dict[str, int]
    dialect_breakdown: dict[str, int]
    sentiment_trend: list[SentimentTrendPoint] = []


class DashboardResponse(BaseModel):
    stats: DashboardStats
    reviews: list[ReviewDetail]
    page: int
    page_size: int
    total_pages: int


# ── Auth schemas ───────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=9, max_length=20)
    business_name_ar: str = Field(..., min_length=1, max_length=255)
    business_name_en: str | None = Field(None, max_length=255)
    package: str = Field(..., pattern=r"^(basic|advanced|enterprise)$")


class RegisterResponse(BaseModel):
    tenant_id: UUID
    message: str


class LoginRequest(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    tenant_id: UUID | None = None
    tenant_status: str | None = None


class DocumentUploadResponse(BaseModel):
    document_id: UUID
    file_name: str
    doc_type: str
    file_url: str


class TenantInfo(BaseModel):
    id: UUID
    name_ar: str
    name_en: str | None
    email: str
    phone: str
    status: str
    package: str
    place_ids: list[str] | None = None
    pending_place_ids: list[str] | None = None
    max_businesses: int
    max_reviews_per_month: int
    reviews_used_this_month: int
    api_key: str | None = None
    rejection_reason: str | None = None
    latest_invoice_status: str | None = None
    card_payment_enabled: bool = False
    subscription_starts_at: datetime | None = None
    subscription_expires_at: datetime | None = None
    created_at: datetime


class DocumentInfo(BaseModel):
    id: UUID
    doc_type: str
    file_name: str
    file_url: str
    uploaded_at: datetime


class UserProfile(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    tenant: TenantInfo | None = None
    invoices: list["InvoiceInfo"] | None = None


# ── Admin schemas ──────────────────────────────────────────────────────

class RegistrationDetail(BaseModel):
    tenant: TenantInfo
    documents: list[DocumentInfo]
    owner: UserProfile | None = None


class RegistrationListResponse(BaseModel):
    registrations: list[RegistrationDetail]
    total: int
    page: int
    total_pages: int


class RejectRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=1000)


class EditTenantRequest(BaseModel):
    name_ar: str | None = Field(None, min_length=1, max_length=255)
    name_en: str | None = Field(None, max_length=255)
    email: str | None = Field(None, max_length=255)
    phone: str | None = Field(None, max_length=20)
    package: str | None = Field(None, pattern=r"^(basic|advanced|enterprise)$")
    card_payment_enabled: bool | None = None


class TenantListResponse(BaseModel):
    tenants: list[TenantInfo]
    total: int
    page: int
    total_pages: int


# ── Subscription & Invoice schemas ────────────────────────────────────

class SubscriptionInfo(BaseModel):
    id: UUID
    package: str
    status: str
    starts_at: datetime | None
    expires_at: datetime | None
    created_at: datetime


class InvoiceInfo(BaseModel):
    id: UUID
    amount_sar: float
    status: str
    hyperpay_checkout_id: str | None = None
    payment_method: str | None = None
    transfer_receipt_url: str | None = None
    transfer_receipt_name: str | None = None
    invoice_number: str | None = None
    invoice_pdf_url: str | None = None
    vat_amount: float | None = None
    total_with_vat: float | None = None
    paid_at: datetime | None
    created_at: datetime


class CheckoutRequest(BaseModel):
    invoice_id: UUID


class BankTransferUploadResponse(BaseModel):
    invoice_id: UUID
    status: str
    message: str
    transfer_receipt_name: str | None = None


class CheckoutResponse(BaseModel):
    checkout_id: str
    redirect_url: str
    is_mock: bool = False


class PaymentStatusResponse(BaseModel):
    invoice_id: UUID
    status: str
    amount_sar: float
    paid_at: datetime | None = None


# ── Place ID schemas ──────────────────────────────────────────────────

class ConfirmPlaceIdRequest(BaseModel):
    place_id: str = Field(..., min_length=1, max_length=255)


class ConfirmPlaceIdResponse(BaseModel):
    place_id: str
    place_name: str | None = None
    message: str


class PlaceSearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)


class PlaceSearchResult(BaseModel):
    place_id: str
    name: str
    address: str | None = None
    rating: float | None = None
    user_ratings_total: int | None = None
    types: list[str] | None = None
    maps_url: str | None = None


class PlaceSearchResponse(BaseModel):
    results: list[PlaceSearchResult]
    query: str
    source: str = "text_search"


# ── Fetch Reviews schemas ─────────────────────────────────────────────

class FetchReviewsResponse(BaseModel):
    place_id: str
    business_name: str
    reviews_fetched: int
    reviews_new: int
    reviews_analyzed: int
    message: str


# ── Delete Account schemas ───────────────────────────────────────────

class DeleteAccountRequest(BaseModel):
    reason: str | None = Field(None, max_length=500, description="Reason for account deletion")


# ── Upgrade schemas ─────────────────────────────────────────────────

class UpgradeRequest(BaseModel):
    target_package: str = Field(..., pattern=r"^(basic|advanced|enterprise)$")


class UpgradeResponse(BaseModel):
    subscription_id: UUID
    invoice_id: UUID
    amount_sar: float
    target_package: str
    message: str


# ── Forgot Password schemas ──────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: str = Field(..., max_length=255)


class VerifyResetCodeRequest(BaseModel):
    email: str = Field(..., max_length=255)
    code: str = Field(..., min_length=6, max_length=6)


class ResetPasswordRequest(BaseModel):
    email: str = Field(..., max_length=255)
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8, max_length=128)


# ── Admin Dashboard schemas ─────────────────────────────────────────

class RevenueTrendPoint(BaseModel):
    month: str  # YYYY-MM
    revenue: float
    invoice_count: int


class PackageDistribution(BaseModel):
    package: str
    count: int


class RecentActivity(BaseModel):
    type: str  # "registration", "payment", "activation"
    tenant_name: str
    detail: str
    timestamp: datetime


class AdminDashboardStats(BaseModel):
    total_revenue: float
    active_tenants: int
    total_reviews: int
    active_subscriptions: int
    pending_registrations: int
    pending_bank_transfers: int
    revenue_trend: list[RevenueTrendPoint] = []
    package_distribution: list[PackageDistribution] = []
    recent_activity: list[RecentActivity] = []


# ── Admin Invoice schemas ────────────────────────────────────────────

class AdminInvoiceItem(BaseModel):
    id: UUID
    invoice_number: str | None = None
    tenant_id: UUID
    tenant_name: str
    tenant_email: str
    package: str
    amount_sar: float
    vat_amount: float | None = None
    total_with_vat: float | None = None
    status: str
    payment_method: str | None = None
    invoice_pdf_url: str | None = None
    paid_at: datetime | None = None
    created_at: datetime


class AdminInvoiceListResponse(BaseModel):
    invoices: list[AdminInvoiceItem]
    total: int
    page: int
    total_pages: int


class CreateInvoiceRequest(BaseModel):
    tenant_id: UUID
    package: str = Field(..., pattern=r"^(basic|advanced|enterprise)$")
    amount_sar: float | None = None  # auto-calculate from package if None


# ── Admin Reports schemas ────────────────────────────────────────────

class RevenueReportItem(BaseModel):
    month: str
    package: str
    invoice_count: int
    revenue: float
    vat: float
    total_with_vat: float


class TenantActivityItem(BaseModel):
    id: UUID
    name_ar: str
    email: str
    package: str
    status: str
    reviews_used: int
    max_reviews: int
    subscription_status: str | None = None
    subscription_expires_at: datetime | None = None


class RevenueReportResponse(BaseModel):
    items: list[RevenueReportItem]
    total_revenue: float
    total_vat: float
    total_with_vat: float


class TenantActivityResponse(BaseModel):
    tenants: list[TenantActivityItem]
    total: int
    page: int
    total_pages: int
