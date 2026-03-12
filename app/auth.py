from fastapi import HTTPException, Security
from fastapi.security import APIKeyHeader

from app.config import get_settings

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(
    api_key: str | None = Security(_api_key_header),
) -> str:
    """
    Validate the X-API-Key header. Returns the tenant_id.
    If no API key is configured (dev mode), allow all requests.
    """
    settings = get_settings()

    # Dev mode: no key configured → allow everything
    if not settings.api_key:
        return settings.default_tenant_id

    if not api_key:
        raise HTTPException(status_code=401, detail="Missing X-API-Key header")

    if api_key != settings.api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")

    return settings.default_tenant_id
