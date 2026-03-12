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
