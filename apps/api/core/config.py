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
    
    # Environment mode (e.g. "development", "production")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    @property
    def DATABASE_URL(self) -> str:
        # Use SQLite for local development
        if self.ENVIRONMENT in ["development", "local", "test"]:
            return "sqlite:///./corales.db"
        # Use Postgres in Production (e.g. Railway)
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

settings = Settings()
