import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import traceback

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

VERSION = "7.1.9_FINAL_DEBUG"
router_error = "No error recorded yet"

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f">>> STARTING Corales API {VERSION}")
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

@app.get("/")
def read_root():
    return {
        "status": "CoralApp API Active",
        "version": VERSION,
        "router_error_summary": router_error[:200] if router_error else "None"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "version": VERSION}

@app.get("/api/v1/auth-check")
def auth_check():
    return {
        "status": "present",
        "version": VERSION,
        "router_error": router_error
    }

# Intento de carga del ruteador real
try:
    from api.v1.api import api_router
    app.include_router(api_router, prefix="/api/v1")
    logger.info(">>> ROUTER: API v1 included successfully")
    router_error = "NONE: API v1 included successfully"
except Exception:
    router_error = traceback.format_exc()
    logger.error(">>> ERROR ROUTER: Failed to include API v1")
    logger.error(router_error)
