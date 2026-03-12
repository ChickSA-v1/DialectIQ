from fastapi import Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(
    api_key: str | None = Security(_api_key_header),
    db: AsyncSession = Depends(get_db),
) -> str:
    """
    Validate the X-API-Key header.

    1. Try matching against Tenant.api_key in the DB (multi-tenant).
    2. Fall back to the legacy shared key from env (backward compat).
    3. Dev mode: if no shared key configured, allow all requests.

    Returns the tenant_id string (UUID str for DB tenants, or legacy default).
    """
    from app.models import Tenant  # local import to avoid circular

    settings = get_settings()

    # Dev mode: no key configured → allow everything
    if not settings.api_key and not api_key:
        return settings.default_tenant_id

    if not api_key:
        raise HTTPException(status_code=401, detail="Missing X-API-Key header")

    # 1) Check multi-tenant keys in DB
    result = await db.execute(
        select(Tenant).where(Tenant.api_key == api_key, Tenant.status == "active")
    )
    tenant = result.scalar_one_or_none()
    if tenant:
        return str(tenant.id)

    # 2) Legacy shared key
    if settings.api_key and api_key == settings.api_key:
        return settings.default_tenant_id

    raise HTTPException(status_code=403, detail="Invalid API key")
