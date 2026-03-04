import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Corales API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Secret key for JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "unasecretkeymuyseguraparaelmvp1234")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Database
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "corales_db")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")

    # Redis (for RQ job queue and pipeline locks)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Pipeline
    PIPELINE_VERSION: str = "1.0.0"
    
    # Storage Configuration
    STORAGE_MODE: str = os.getenv("STORAGE_MODE", "local") # "local" or "s3"
    S3_BUCKET: str = os.getenv("S3_BUCKET", "corales-assets")
    S3_ACCESS_KEY: str = os.getenv("S3_ACCESS_KEY", "")
    S3_SECRET_KEY: str = os.getenv("S3_SECRET_KEY", "")
    S3_ENDPOINT_URL: str = os.getenv("S3_ENDPOINT_URL", "") # e.g. for R2
    S3_REGION: str = os.getenv("S3_REGION", "auto")
    S3_PUBLIC_URL_OVERRIDE: str = os.getenv("S3_PUBLIC_URL_OVERRIDE", "") # e.g. CDN URL

    # Environment mode (e.g. "development", "production")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    @property
    def DATABASE_URL(self) -> str:
        # 1. First priority: Explicit DATABASE_URL from env (Railway/Heroku/etc.)
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            # SQLAlchemy 1.4+ requires 'postgresql://' instead of 'postgres://'
            if env_url.startswith("postgres://"):
                return env_url.replace("postgres://", "postgresql://", 1)
            return env_url

        # 2. Fallback: SQLite (works everywhere without config)
        return "sqlite:///./corales.db"

settings = Settings()
