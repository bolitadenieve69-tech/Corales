from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Execute on startup
    logger.info("Iniciando aplicación Corales API...")
    try:
        from create_admin import seed_admin
        seed_admin()
    except Exception as e:
        logger.error(f"Fallo en el seeding inicial: {e}")
    yield
    logger.info("Apagando aplicación Corales API...")

app = FastAPI(
    title="Corales API",
    description="API para la gestión de coros y progreso de estudio",
    version="1.0.0",
    lifespan=lifespan
)

from api.v1.api import api_router
from core.config import settings

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allow_origins = [FRONTEND_URL]
if settings.ENVIRONMENT in ["development", "local"]:
    allow_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}
