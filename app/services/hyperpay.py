"""
HyperPay payment gateway integration for Saudi Arabia.
Docs: https://wordpresshyperpay.docs.oppwa.com
"""

import structlog
import httpx

from app.config import get_settings

log = structlog.get_logger()
settings = get_settings()


async def create_checkout(
    amount: float,
    currency: str = "SAR",
    merchant_transaction_id: str = "",
    customer_email: str = "",
) -> dict:
    """
    Create a HyperPay checkout session.
    Returns dict with 'id' (checkout_id) for the frontend widget.
    """
    url = f"{settings.hyperpay_base_url}/v1/checkouts"
    data = {
        "entityId": settings.hyperpay_entity_id,
        "amount": f"{amount:.2f}",
        "currency": currency,
        "paymentType": "DB",  # Debit
        "merchantTransactionId": merchant_transaction_id,
        "customer.email": customer_email,
    }
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


async def get_payment_status(resource_path: str) -> dict:
    """
    Query HyperPay for payment status after customer completes checkout.
    resource_path comes from the shopperResultUrl callback.
    """
    url = f"{settings.hyperpay_base_url}{resource_path}"
    params = {"entityId": settings.hyperpay_entity_id}
    headers = {
        "Authorization": f"Bearer {settings.hyperpay_access_token}",
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, params=params, headers=headers)

    result = resp.json()

    # HyperPay success codes: 000.000.000, 000.000.100, 000.100.1xx, 000.100.2xx
    result_code = result.get("result", {}).get("code", "")
    is_success = result_code.startswith("000.000.") or result_code.startswith("000.100.")

    log.info(
        "hyperpay_payment_status",
        resource_path=resource_path,
        code=result_code,
        is_success=is_success,
    )
    return {**result, "_is_success": is_success}
