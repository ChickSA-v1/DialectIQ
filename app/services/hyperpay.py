"""
HyperPay payment gateway integration for Saudi Arabia.
Docs: https://wordpresshyperpay.docs.oppwa.com

Set HYPERPAY_MOCK=true to use a built-in mock gateway (no real charges).
"""

import uuid as _uuid

import structlog
import httpx

from app.config import get_settings

log = structlog.get_logger()
settings = get_settings()


# ── Mock implementation ──────────────────────────────────────────────

async def _mock_create_checkout(
    amount: float,
    currency: str,
    merchant_transaction_id: str,
    customer_email: str,
    shopper_result_url: str,
) -> dict:
    """Return a fake checkout with a MOCK_ prefix so the frontend knows."""
    checkout_id = f"MOCK_{_uuid.uuid4().hex[:24].upper()}"
    log.info(
        "mock_checkout_created",
        checkout_id=checkout_id,
        amount=amount,
        currency=currency,
    )
    return {
        "id": checkout_id,
        "result": {"code": "000.200.100", "description": "successfully created checkout"},
    }


async def _mock_get_payment_status(resource_path: str) -> dict:
    """Always return success for mock payments."""
    log.info("mock_payment_status", resource_path=resource_path, is_success=True)
    return {
        "result": {"code": "000.000.000", "description": "Transaction succeeded (mock)"},
        "paymentBrand": "VISA",
        "paymentType": "DB",
        "amount": "0.00",
        "currency": "SAR",
        "merchantTransactionId": "",
        "_is_success": True,
    }


# ── Real implementation ──────────────────────────────────────────────

async def _real_create_checkout(
    amount: float,
    currency: str,
    merchant_transaction_id: str,
    customer_email: str,
    shopper_result_url: str,
) -> dict:
    url = f"{settings.hyperpay_base_url}/v1/checkouts"
    data = {
        "entityId": settings.hyperpay_entity_id,
        "amount": f"{amount:.2f}",
        "currency": currency,
        "paymentType": "DB",
        "merchantTransactionId": merchant_transaction_id,
        "customer.email": customer_email,
        "testMode": "EXTERNAL",
    }
    if shopper_result_url:
        data["shopperResultUrl"] = shopper_result_url
    headers = {
        "Authorization": f"Bearer {settings.hyperpay_access_token}",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(url, data=data, headers=headers)

    result = resp.json()
    log.info(
        "hyperpay_checkout_created",
        checkout_id=result.get("id"),
        amount=amount,
        currency=currency,
    )
    return result


async def _real_get_payment_status(resource_path: str) -> dict:
    url = f"{settings.hyperpay_base_url}{resource_path}"
    params = {"entityId": settings.hyperpay_entity_id}
    headers = {
        "Authorization": f"Bearer {settings.hyperpay_access_token}",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, params=params, headers=headers)

    result = resp.json()

    result_code = result.get("result", {}).get("code", "")
    result_desc = result.get("result", {}).get("description", "")
    is_success = result_code.startswith("000.000.") or result_code.startswith("000.100.")

    log.info(
        "hyperpay_payment_status",
        resource_path=resource_path,
        code=result_code,
        description=result_desc,
        is_success=is_success,
    )

    if not is_success:
        log.warning(
            "hyperpay_payment_failed_detail",
            code=result_code,
            description=result_desc,
        )

    return {**result, "_is_success": is_success}


# ── Public API (delegates to mock or real) ───────────────────────────

async def create_checkout(
    amount: float,
    currency: str = "SAR",
    merchant_transaction_id: str = "",
    customer_email: str = "",
    shopper_result_url: str = "",
) -> dict:
    """Create a checkout session. Uses mock if HYPERPAY_MOCK=true."""
    if settings.hyperpay_mock:
        return await _mock_create_checkout(
            amount, currency, merchant_transaction_id, customer_email, shopper_result_url
        )
    return await _real_create_checkout(
        amount, currency, merchant_transaction_id, customer_email, shopper_result_url
    )


async def get_payment_status(resource_path: str) -> dict:
    """Query payment status. Uses mock if HYPERPAY_MOCK=true."""
    if settings.hyperpay_mock:
        return await _mock_get_payment_status(resource_path)
    return await _real_get_payment_status(resource_path)
