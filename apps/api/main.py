from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import sys

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

router_error = "No error recorded yet"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Safe startup: log version and env
    logger.info(">>> ARRANQUE: Corales API v7.1.0_STABLE")
    logger.info(f">>> ENV: {os.getenv('ENVIRONMENT', 'unknown')}")
    
    # We will trigger seeding/migrations manually or after start to not block healthcheck
    try:
        from create_admin import seed_admin
        seed_admin()
        logger.info(">>> ADMIN: Seeding verificado.")
    except Exception as e:
        logger.error(f">>> ERROR SEEDING: {e}")
        
    yield

app = FastAPI(title="Corales API", version="1.0.0", lifespan=lifespan)

# Robust CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "CoralApp API Active",
        "version": "7.1.0_STABLE",
        "info": "Full business logic restored"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "7.1.0"}

# API Routes - RESTORED
try:
    from api.v1.api import api_router
    app.include_router(api_router, prefix="/api/v1")
    logger.info(">>> ROUTER: API v1 included successfully")
    router_error = "NONE: API v1 included successfully"
except Exception:
    import traceback
    router_error = traceback.format_exc()
    logger.error(">>> ERROR ROUTER: Failed to include API v1")
    logger.error(router_error)

# Add a direct debug endpoint just in case
@app.get("/api/v1/auth-check")
def auth_check():
    return {"status": "present", "version": "7.1.9", "router_error": router_error}
