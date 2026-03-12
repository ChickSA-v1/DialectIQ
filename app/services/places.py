"""
Google Places API integration for business search.
Uses the Places API (New) — Text Search and Place Details.

Docs: https://developers.google.com/maps/documentation/places/web-service
"""

import re
from urllib.parse import unquote

import httpx
import structlog

from app.config import get_settings

log = structlog.get_logger()
settings = get_settings()

PLACES_BASE = "https://places.googleapis.com/v1"

# Regex patterns for extracting info from Google Maps URLs
PLACE_ID_RE = re.compile(r"ChIJ[\w-]{20,}")
MAPS_PLACE_NAME_RE = re.compile(r"/maps/place/([^/@]+)")


async def search_places(query: str, region: str = "SA") -> list[dict]:
    """
    Search for businesses using Google Places Text Search (New).
    Returns a normalized list of place results.
    """
    if not settings.google_places_api_key:
        log.warning("google_places_api_key_not_set")
        return []

    url = f"{PLACES_BASE}/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.google_places_api_key,
        "X-Goog-FieldMask": (
            "places.id,places.displayName,places.formattedAddress,"
            "places.rating,places.userRatingCount,places.types,"
            "places.googleMapsUri"
        ),
    }
    body = {
        "textQuery": query,
        "regionCode": region,
        "languageCode": "ar",
        "maxResultCount": 5,
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(url, json=body, headers=headers)

        if resp.status_code != 200:
            log.error(
                "places_search_failed",
                status=resp.status_code,
                body=resp.text[:500],
            )
            return []

        data = resp.json()
        places = data.get("places", [])

        results = []
        for p in places:
            results.append({
                "place_id": p.get("id", ""),
                "name": p.get("displayName", {}).get("text", ""),
                "address": p.get("formattedAddress"),
                "rating": p.get("rating"),
                "user_ratings_total": p.get("userRatingCount"),
                "types": p.get("types"),
                "maps_url": p.get("googleMapsUri"),
            })

        log.info("places_search_ok", query=query, count=len(results))
        return results

    except Exception as e:
        log.error("places_search_exception", query=query, error=str(e))
        return []


async def resolve_maps_url(url: str) -> dict | None:
    """
    Extract place info from a Google Maps URL.
    Supports both short links (goo.gl) and full URLs.
    """
    try:
        original_url = url

        # Step 1: Follow short URL redirects
        if "goo.gl" in url or "maps.app" in url:
            async with httpx.AsyncClient(
                follow_redirects=False,
                timeout=10,
                headers={"User-Agent": "DialectIQ/1.0"},
            ) as client:
                resp = await client.get(url)
                location = resp.headers.get("location", url)
                if location != url:
                    url = location
                    log.info("maps_url_redirected", original=original_url, resolved=url[:200])

        # Step 2: Try direct Place ID extraction from URL
        match = PLACE_ID_RE.search(url)
        if match:
            place_id = match.group(0)
            # Fetch details for this Place ID
            details = await get_place_details(place_id)
            if details:
                return {**details, "source": "url_direct"}
            return {"place_id": place_id, "name": place_id, "source": "url_direct"}

        # Step 3: Extract business name from URL and search
        name_match = MAPS_PLACE_NAME_RE.search(url)
        if name_match:
            name = unquote(name_match.group(1)).replace("+", " ")
            log.info("maps_url_name_extracted", name=name)
            results = await search_places(name)
            if results:
                return {**results[0], "source": "url_search"}

        log.warning("maps_url_no_result", url=original_url)
        return None

    except Exception as e:
        log.error("maps_url_resolve_failed", url=url, error=str(e))
        return None


async def get_place_details(place_id: str) -> dict | None:
    """
    Fetch basic details for a single Place ID.
    Used for validation and to get the business name.
    """
    if not settings.google_places_api_key:
        return None

    url = f"{PLACES_BASE}/places/{place_id}"
    headers = {
        "X-Goog-Api-Key": settings.google_places_api_key,
        "X-Goog-FieldMask": "id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri",
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=headers)

        if resp.status_code != 200:
            log.warning("place_details_failed", place_id=place_id, status=resp.status_code)
            return None

        data = resp.json()
        return {
            "place_id": data.get("id", place_id),
            "name": data.get("displayName", {}).get("text", ""),
            "address": data.get("formattedAddress"),
            "rating": data.get("rating"),
            "user_ratings_total": data.get("userRatingCount"),
            "maps_url": data.get("googleMapsUri"),
        }

    except Exception as e:
        log.error("place_details_exception", place_id=place_id, error=str(e))
        return None
