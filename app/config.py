from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Secure Payment Transaction Engine"
    api_key: str
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "payment_engine"
    db_user: str = "postgres"
    db_password: str
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_topic: str = "payment-events"
    rate_limit_per_minute: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
