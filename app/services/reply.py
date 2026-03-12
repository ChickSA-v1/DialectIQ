import time

import structlog
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings
from app.prompts.auto_reply import AUTO_REPLY_PROMPT, build_reply_message

logger = structlog.get_logger()
settings = get_settings()

_client = AsyncOpenAI(api_key=settings.openai_api_key)


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=3),
    reraise=True,
)
async def generate_reply(
    review_text: str,
    sentiment_score: float,
    category: str,
    urgency_level: str,
    dialect_detected: str,
    translated_intent: str,
    author_name: str,
    business_name: str,
) -> tuple[str, int]:
    """
    Generate a culturally appropriate Arabic reply to a review.

    Returns:
        Tuple of (reply text, latency in ms).
    """
    user_message = build_reply_message(
        review_text=review_text,
        sentiment_score=sentiment_score,
        category=category,
        urgency_level=urgency_level,
        dialect_detected=dialect_detected,
        translated_intent=translated_intent,
        author_name=author_name,
        business_name=business_name,
    )

    start = time.perf_counter()

    response = await _client.chat.completions.create(
        model=settings.openai_model,
        max_tokens=512,
        messages=[
            {"role": "system", "content": AUTO_REPLY_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.4,  # slight creativity for natural-sounding replies
    )

    latency_ms = int((time.perf_counter() - start) * 1000)
    reply_text = response.choices[0].message.content.strip()

    logger.debug("reply_generated", length=len(reply_text), latency_ms=latency_ms)

    return reply_text, latency_ms
