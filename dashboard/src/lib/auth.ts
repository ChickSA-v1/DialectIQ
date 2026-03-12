/**
 * Auth utilities: login, register, token management, API calls with JWT.
 */

import {
  LoginResponse,
  RegisterResponse,
  UserProfile,
  RegistrationListResponse,
  TenantListResponse,
  DocumentInfo,
  InvoiceInfo,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://dialectiq-api-297578317935.me-central1.run.app";

// ── Token management ──────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dialectiq-token");
}

export function setToken(token: string): void {
  localStorage.setItem("dialectiq-token", token);
}

export function clearToken(): void {
  localStorage.removeItem("dialectiq-token");
  localStorage.removeItem("dialectiq-role");
  localStorage.removeItem("dialectiq-tenant-status");
}

export function getRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("dialectiq-role");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// ── Authenticated fetch wrapper ───────────────────────────────────────

async function authFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Only set Content-Type for JSON requests (not multipart)
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  return res;
}

// ── Auth API ──────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  const data: LoginResponse = await res.json();
  setToken(data.access_token);
  localStorage.setItem("dialectiq-role", data.role);
  if (data.tenant_status) {
    localStorage.setItem("dialectiq-tenant-status", data.tenant_status);
  }
  return data;
}

export async function register(data: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  business_name_ar: string;
  business_name_en?: string;
  package: string;
}): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function uploadDocument(
  tenantId: string,
  docType: string,
  file: File
): Promise<DocumentInfo> {
  const formData = new FormData();
  formData.append("tenant_id", tenantId);
  formData.append("doc_type", docType);
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/v1/auth/upload-document`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function getProfile(): Promise<UserProfile> {
  const res = await authFetch("/api/v1/auth/me");
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json();
}

// ── Admin API ─────────────────────────────────────────────────────────

export async function fetchRegistrations(
  page = 1
): Promise<RegistrationListResponse> {
  const res = await authFetch(`/api/v1/admin/registrations?page=${page}`);
  if (!res.ok) throw new Error("Failed to load registrations");
  return res.json();
}

export async function fetchRegistrationDetail(tenantId: string): Promise<any> {
  const res = await authFetch(`/api/v1/admin/registrations/${tenantId}`);
  if (!res.ok) throw new Error("Failed to load registration detail");
  return res.json();
}

export async function approveRegistration(
  tenantId: string
): Promise<{ message: string; invoice_id: string; amount_sar: number }> {
  const res = await authFetch(
    `/api/v1/admin/registrations/${tenantId}/approve`,
    { method: "POST" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Approval failed");
  }
  return res.json();
}

export async function rejectRegistration(
  tenantId: string,
  reason: string
): Promise<{ message: string }> {
  const res = await authFetch(
    `/api/v1/admin/registrations/${tenantId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Rejection failed");
  }
  return res.json();
}

export async function fetchTenants(
  status?: string,
  page = 1
): Promise<TenantListResponse> {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  const res = await authFetch(`/api/v1/admin/tenants?${params}`);
  if (!res.ok) throw new Error("Failed to load tenants");
  return res.json();
}

export async function activateTenant(
  tenantId: string
): Promise<{ message: string; api_key: string }> {
  const res = await authFetch(`/api/v1/admin/tenants/${tenantId}/activate`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Activation failed");
  }
  return res.json();
}

// ── Payment API ───────────────────────────────────────────────────────

export async function createCheckout(
  invoiceId: string
): Promise<{ checkout_id: string; redirect_url: string; is_mock: boolean }> {
  const res = await authFetch("/api/v1/payments/checkout", {
    method: "POST",
    body: JSON.stringify({ invoice_id: invoiceId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Checkout failed");
  }
  return res.json();
}

export async function getPaymentStatus(invoiceId: string): Promise<{
  invoice_id: string;
  status: string;
  amount_sar: number;
  paid_at: string | null;
}> {
  const res = await authFetch(`/api/v1/payments/status/${invoiceId}`);
  if (!res.ok) throw new Error("Failed to check payment status");
  return res.json();
}

export async function verifyPaymentResult(
  checkoutId: string,
  resourcePath: string
): Promise<{
  invoice_id: string;
  status: string;
  amount_sar: number;
  paid_at: string | null;
}> {
  const params = new URLSearchParams({ id: checkoutId, resourcePath });
  const res = await fetch(
    `${API_BASE}/api/v1/payments/result?${params}`,
    { cache: "no-store" }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Payment verification failed");
  }
  return res.json();
}

// ── Place ID API ──────────────────────────────────────────────────────

export async function confirmPlaceId(
  placeId: string
): Promise<{ place_id: string; message: string }> {
  const res = await authFetch("/api/v1/tenant/confirm-place-id", {
    method: "POST",
    body: JSON.stringify({ place_id: placeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Place ID confirmation failed");
  }
  return res.json();
}

// ── Document Viewer ──────────────────────────────────────────────────

export async function viewDocument(documentId: string): Promise<void> {
  const res = await authFetch(`/api/v1/admin/documents/${documentId}/view`);
  if (!res.ok) throw new Error("Failed to load document");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

export function logout(): void {
  clearToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
