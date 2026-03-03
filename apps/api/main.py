from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import sys

# Logging configuration for Production
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

def run_migrations():
    """Ejecuta las migraciones de Alembic programáticamente."""
    try:
        from alembic.config import Config
        from alembic import command
        
        logger.info(">>> MIGRACIONES: Iniciando actualización de base de datos...")
        base_dir = os.path.dirname(os.path.abspath(__file__))
        alembic_cfg = Config(os.path.join(base_dir, "alembic.ini"))
        
        from core.config import settings
        alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
        
        command.upgrade(alembic_cfg, "head")
        logger.info(">>> MIGRACIONES: Base de datos actualizada con éxito.")
    except Exception as e:
        logger.error(f">>> ERROR MIGRACIONES: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Execute on startup
    logger.info(">>> ARRANQUE: Iniciando CoralApp API (v5.0.0_STABLE)")
    
    # Run migrations in the background process
    run_migrations()
    
    # Seed admin user
    try:
        from create_admin import seed_admin
        seed_admin()
        logger.info(">>> ADMIN: Seeding verificado de forma segura.")
    except Exception as e:
        logger.error(f">>> ERROR ADMIN SEEDING: {e}")
        
    yield
    logger.info(">>> APAGADO: Cerrando servidor.")

app = FastAPI(
    title="Corales API",
    description="API de Producción para CoralApp",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allow_origins = [
    FRONTEND_URL, 
    "https://corales-omega.vercel.app", 
    "http://127.0.0.1:3000"
]
if os.getenv("ENVIRONMENT") in ["development", "local"]:
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
    return {
        "status": "CoralApp API - Production Active",
        "version": "5.0.0_STABLE",
        "build": "FINAL"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "5.0.0"}

# RESTORE ALL ROUTES
from api.v1.api import api_router
app.include_router(api_router, prefix="/api/v1")
