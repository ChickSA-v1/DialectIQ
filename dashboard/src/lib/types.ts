export interface ReviewDetail {
  id: string;
  business_name: string;
  place_id: string;
  author: string | null;
  raw_text: string;
  rating: number | null;
  source: string | null;
  sentiment_score: number | null;
  category: string | null;
  urgency_level: string | null;
  dialect_detected: string | null;
  translated_intent: string | null;
  suggested_reply: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_reviews: number;
  avg_sentiment: number | null;
  avg_rating: number | null;
  urgency_breakdown: Record<string, number>;
  category_breakdown: Record<string, number>;
  dialect_breakdown: Record<string, number>;
}

export interface DashboardResponse {
  stats: DashboardStats;
  reviews: ReviewDetail[];
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Filters {
  place_id?: string;
  business_name?: string;
  category?: string;
  urgency?: string;
}

// ── Auth types ────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
  tenant_id: string | null;
  tenant_status: string | null;
}

export interface RegisterResponse {
  tenant_id: string;
  message: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  tenant: TenantInfo | null;
}

export interface TenantInfo {
  id: string;
  name_ar: string;
  name_en: string | null;
  email: string;
  phone: string;
  status: string;
  package: string;
  place_ids: string[] | null;
  rejection_reason?: string | null;
  max_businesses: number;
  max_reviews_per_month: number;
  reviews_used_this_month: number;
  api_key: string | null;
  created_at: string;
}

export interface DocumentInfo {
  id: string;
  doc_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

export interface RegistrationDetail {
  tenant: TenantInfo;
  documents: DocumentInfo[];
  owner: UserProfile | null;
}

export interface RegistrationListResponse {
  registrations: RegistrationDetail[];
  total: number;
  page: number;
  total_pages: number;
}

export interface TenantListResponse {
  tenants: TenantInfo[];
  total: number;
  page: number;
  total_pages: number;
}

export interface InvoiceInfo {
  id: string;
  amount_sar: number;
  status: string;
  hyperpay_checkout_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface SubscriptionInfo {
  id: string;
  package: string;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}
