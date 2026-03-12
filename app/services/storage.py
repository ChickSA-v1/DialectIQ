"""
Google Cloud Storage service for document uploads.
"""

import uuid
from datetime import datetime

import structlog
from google.cloud import storage

from app.config import get_settings

log = structlog.get_logger()
settings = get_settings()

_client: storage.Client | None = None


def _get_client() -> storage.Client:
    global _client
    if _client is None:
        _client = storage.Client()
    return _client


async def upload_document(
    file_content: bytes,
    file_name: str,
    content_type: str,
    tenant_id: str,
    doc_type: str,
) -> str:
    """
    Upload a document to GCS.
    Returns the public URL / GCS path.
    """
    client = _get_client()
    bucket = client.bucket(settings.gcs_bucket_name)

    # Build unique blob path: {tenant_id}/{doc_type}_{timestamp}_{uuid}.ext
    ext = file_name.rsplit(".", 1)[-1] if "." in file_name else "bin"
    ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    blob_name = f"{tenant_id}/{doc_type}_{ts}_{uuid.uuid4().hex[:8]}.{ext}"

    blob = bucket.blob(blob_name)
    blob.upload_from_string(file_content, content_type=content_type)

    # Make publicly readable (or use signed URLs for production)
    url = f"https://storage.googleapis.com/{settings.gcs_bucket_name}/{blob_name}"
    log.info("document_uploaded", tenant_id=tenant_id, doc_type=doc_type, blob=blob_name)
    return url
