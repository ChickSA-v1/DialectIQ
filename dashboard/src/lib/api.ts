import { DashboardResponse, Filters } from "./types";
import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://dialectiq-api-297578317935.me-central1.run.app";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

export async function fetchDashboard(
  filters: Filters = {},
  page = 1,
  pageSize = 20,
): Promise<DashboardResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  if (filters.place_id) params.set("place_id", filters.place_id);
  if (filters.business_name) params.set("business_name", filters.business_name);
  if (filters.category) params.set("category", filters.category);
  if (filters.urgency) params.set("urgency", filters.urgency);

  // Use JWT token if logged in, otherwise fall back to API key
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const res = await fetch(`${API_BASE}/api/v1/dashboard?${params.toString()}`, {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function exportCSV(filters: Filters = {}): Promise<void> {
  const params = new URLSearchParams();
  if (filters.place_id) params.set("place_id", filters.place_id);
  if (filters.business_name) params.set("business_name", filters.business_name);
  if (filters.category) params.set("category", filters.category);
  if (filters.urgency) params.set("urgency", filters.urgency);

  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (API_KEY) {
    headers["X-API-Key"] = API_KEY;
  }

  const res = await fetch(`${API_BASE}/api/v1/dashboard/export?${params.toString()}`, {
    headers,
  });

  if (!res.ok) throw new Error(`Export failed: ${res.status}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reviews_export.csv";
  a.click();
  URL.revokeObjectURL(url);
}
