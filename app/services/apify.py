"""
Apify integration for fetching Google Maps reviews at scale.
Used for paid tenants only — trial tenants use Google Places API (5 reviews).
"""

import httpx
import structlog

from app.config import get_settings

log = structlog.get_logger()

APIFY_BASE = "https://api.apify.com/v2"


async def fetch_reviews_apify(
    place_url: str,
    max_reviews: int = 100,
) -> list[dict]:
    """
    Fetch Google Maps reviews using Apify actor.

    Args:
        place_url: Google Maps URL or place ID (e.g., "ChIJ...")
        max_reviews: Maximum reviews to fetch (respects tenant quota)

    Returns:
        List of review dicts with: text, rating, author, publishedAtDate
    """
    settings = get_settings()

    if not settings.apify_api_token:
        log.warning("apify_skipped_no_token")
        return []

    actor_id = settings.apify_google_reviews_actor

    # Build the actor input
    # If it's a place_id (starts with ChIJ), convert to Maps URL
    if place_url.startswith("ChIJ") or place_url.startswith("0x"):
        start_url = f"https://www.google.com/maps/place/?q=place_id:{place_url}"
    else:
        start_url = place_url

    actor_input = {
        "startUrls": [{"url": start_url}],
        "maxReviews": min(max_reviews, 1000),
        "reviewsSort": "newest",
        "language": "ar",
        "personalData": False,
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            # Start actor run and wait for it to finish
            run_url = f"{APIFY_BASE}/acts/{actor_id}/run-sync-get-dataset-items"
            resp = await client.post(
                run_url,
                params={"token": settings.apify_api_token},
                json=actor_input,
                timeout=120,
            )

            if resp.status_code != 200 and resp.status_code != 201:
                log.error(
                    "apify_actor_failed",
                    status=resp.status_code,
                    body=resp.text[:500],
                )
                return []

            items = resp.json()

            # Parse reviews from Apify output
            reviews = []
            for item in items:
                # Apify Google Maps Reviews Scraper returns reviews in different formats
                # depending on the actor version. Handle common formats.
                if "reviews" in item:
                    for review in item.get("reviews", []):
                        reviews.append(_parse_review(review))
                elif "text" in item or "reviewBody" in item:
                    reviews.append(_parse_review(item))

            log.info(
                "apify_reviews_fetched",
                place=place_url[:50],
                total=len(reviews),
                max_requested=max_reviews,
            )
            return reviews[:max_reviews]

    except httpx.TimeoutException:
        log.error("apify_timeout", place=place_url[:50])
        return []
    except Exception as e:
        log.error("apify_error", error=str(e), place=place_url[:50])
        return []


def _parse_review(raw: dict) -> dict:
    """Normalize review data from various Apify output formats."""
    return {
        "text": raw.get("text") or raw.get("reviewBody") or raw.get("snippet") or "",
        "rating": raw.get("stars") or raw.get("rating") or raw.get("reviewRating"),
        "author_name": raw.get("name") or raw.get("authorName") or raw.get("author") or "Anonymous",
        "publish_time": raw.get("publishedAtDate") or raw.get("publishAt") or raw.get("time"),
        "language": raw.get("reviewLanguage") or raw.get("language") or "ar",
    }


async def calculate_reviews_to_fetch(
    tenant_max: int,
    tenant_used: int,
    place_count: int,
) -> int:
    """
    Calculate how many reviews to fetch per place based on remaining quota.

    Distributes remaining quota evenly across places.
    """
    remaining = max(0, tenant_max - tenant_used)
    if place_count <= 0 or remaining <= 0:
        return 0

    # Distribute evenly, minimum 10 per place
    per_place = max(10, remaining // place_count)
    return min(per_place, 200)  # Cap at 200 per run to control costs
