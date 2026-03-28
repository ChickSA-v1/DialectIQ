from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Core ---
    environment: str = "development"
    log_level: str = "INFO"

    # --- Database ---
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/dialectiq"

    # --- OpenAI ---
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_max_tokens: int = 4096

    # --- Auth ---
    api_key: str = ""  # legacy shared key (still accepted for backward compat)
    default_tenant_id: str = "default"

    # --- JWT ---
    jwt_secret_key: str = "change-me-in-production-use-openssl-rand-hex-32"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 hours

    # --- Google Cloud Storage ---
    gcs_bucket_name: str = "dialectiq-documents"

    # --- Google Places ---
    google_places_api_key: str = ""

    # --- HyperPay ---
    hyperpay_entity_id: str = ""
    hyperpay_access_token: str = ""
    hyperpay_base_url: str = "https://eu-test.oppwa.com"  # test; prod = https://eu-prod.oppwa.com
    hyperpay_mock: bool = False  # Set True to use mock payment gateway

    # --- Dashboard ---
    dashboard_url: str = "http://localhost:3000"  # set via env in production

    # --- Email / SMTP ---
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""  # Gmail address
    smtp_password: str = ""  # Gmail App Password
    admin_notification_email: str = "aalmahlasi@gmail.com"

    # --- Apify ---
    apify_api_token: str = ""
    apify_google_reviews_actor: str = "compass/google-maps-reviews-scraper"

    # --- Limits ---
    max_batch_size: int = 50

    @property
    def sync_database_url(self) -> str:
        return self.database_url.replace("+asyncpg", "+psycopg2")


@lru_cache
def get_settings() -> Settings:
    return Settings()
