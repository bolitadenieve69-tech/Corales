import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from api.v1.api import api_router
from core.database import engine, Base
import traceback

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

VERSION = "7.2.0_STABLE"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info(f">>> STARTING Corales API {VERSION}")
    # Migrations/Check DB connectivity here if needed
    yield
    logger.info(">>> SHUTTING DOWN Corales API")

app = FastAPI(
    title="Corales API",
    version=VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoints
@app.get("/")
def read_root():
    return {
        "status": "CoralApp API Active",
        "version": VERSION,
        "info": "Full business logic stable"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "version": VERSION}

# Include main API router
app.include_router(api_router, prefix="/api/v1")

@app.get("/api/v1/auth-check")
def auth_check():
    """Simple connectivity check for the frontend."""
    return {"status": "connected", "version": VERSION}

# Error handler for internal issues to prevent 500 without logs
@app.middleware("http")
async def log_internal_errors(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f">>> CRITICAL ERROR: {str(e)}")
        logger.error(traceback.format_exc())
        return HTTPException(status_code=500, detail="Internal Server Error")
