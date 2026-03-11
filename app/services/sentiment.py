import time

import anthropic
import orjson
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings
from app.prompts.saudi_dialect import SYSTEM_PROMPT, build_user_message
from app.schemas import SentimentOutput

logger = structlog.get_logger()
settings = get_settings()

_client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)


class AnalysisError(Exception):
    """Raised when Claude returns unparseable or invalid output."""


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=5),
    reraise=True,
)
async def analyze_reviews(texts: list[str]) -> tuple[list[SentimentOutput], int]:
    """
    Send reviews to Claude for sentiment analysis.

    Returns:
        Tuple of (parsed results, latency in ms).
    """
    user_message = build_user_message(texts)
    start = time.perf_counter()

    response = await _client.messages.create(
        model=settings.claude_model,
        max_tokens=settings.claude_max_tokens,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
        temperature=0.0,
    )

    latency_ms = int((time.perf_counter() - start) * 1000)

    raw_text = response.content[0].text.strip()
    logger.debug("claude_raw_response", length=len(raw_text), latency_ms=latency_ms)

    # --- Parse JSON ---
    try:
        parsed = orjson.loads(raw_text)
    except orjson.JSONDecodeError as e:
        logger.error("json_parse_failed", raw=raw_text[:500], error=str(e))
        raise AnalysisError(f"Claude returned invalid JSON: {e}") from e

    if not isinstance(parsed, list) or len(parsed) != len(texts):
        raise AnalysisError(
            f"Expected {len(texts)} results, got {len(parsed) if isinstance(parsed, list) else 'non-list'}"
        )

    # --- Validate each result via Pydantic ---
    results: list[SentimentOutput] = []
    for i, item in enumerate(parsed):
        try:
            results.append(SentimentOutput.model_validate(item))
        except Exception as e:
            logger.error("validation_failed", index=i, item=item, error=str(e))
            raise AnalysisError(f"Result {i} failed validation: {e}") from e

    return results, latency_ms
