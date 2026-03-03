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

@app.get("/")
def read_root():
    return {"status": "CoralApp API is Running", "build_tag": "v3.0.0_final"}

app.include_router(api_router, prefix="/api/v1")
