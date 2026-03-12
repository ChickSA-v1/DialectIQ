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
    text: str = Field(..., min_length=1, max_length=5000)
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
    latency_ms: int | None = None
