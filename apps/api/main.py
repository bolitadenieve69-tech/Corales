from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from api.v1.api import api_router
from core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Execute on startup - Create admin user
    logger.info(">>> ARRANQUE: Iniciando aplicación Corales API (v3.1.0)")
    try:
        from create_admin import seed_admin
        seed_admin()
        logger.info(">>> SEEDING: Proceso de administrador completado.")
    except Exception as e:
        logger.error(f">>> ERROR: Fallo en el seeding inicial: {e}")
    yield
    logger.info(">>> APAGADO: Finalizando aplicación...")

app = FastAPI(
    title="Corales API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS config
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allow_origins = [FRONTEND_URL, "https://corales-omega.vercel.app"]
if settings.ENVIRONMENT in ["development", "local"]:
    allow_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINTS DE SALUD (Críticos para Railway Health Check) ---
@app.get("/")
def read_root():
    return {"status": "CoralApp API Active", "version": "3.1.0"}

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "3.1.0"}

# API Routes
app.include_router(api_router, prefix="/api/v1")
