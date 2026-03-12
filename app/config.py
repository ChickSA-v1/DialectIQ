from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Core ---
    environment: str = "development"
    log_level: str = "INFO"

    # --- Database ---
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/dialectiq"

    # --- Anthropic ---
    anthropic_api_key: str = ""
    claude_model: str = "claude-3-5-sonnet-latest"
    claude_max_tokens: int = 4096

    # --- Auth ---
    api_key: str = ""  # shared secret for MVP; multi-key later
    default_tenant_id: str = "default"

    # --- Limits ---
    max_batch_size: int = 50

    @property
    def sync_database_url(self) -> str:
        return self.database_url.replace("+asyncpg", "+psycopg2")


@lru_cache
def get_settings() -> Settings:
    return Settings()
