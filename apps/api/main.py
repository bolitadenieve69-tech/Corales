from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import sys

from api.v1.api import api_router
from core.config import settings

# Configure detailed logging for Railway
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
        # Localizar el archivo alembic.ini relativo a la raíz de la APP
        base_dir = os.path.dirname(os.path.abspath(__file__))
        alembic_cfg = Config(os.path.join(base_dir, "alembic.ini"))
        
        # Sobrescribir la URL con la de settings por seguridad
        alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
        
        command.upgrade(alembic_cfg, "head")
        logger.info(">>> MIGRACIONES: Base de datos actualizada con éxito.")
    except Exception as e:
        logger.error(f">>> ERROR MIGRACIONES: No se pudieron aplicar las migraciones: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Ejecutar migraciones primero (pero dentro del proceso del servidor)
    logger.info(f">>> ARRANQUE: Iniciando Corales API (v3.2.0) en entorno: {settings.ENVIRONMENT}")
    run_migrations()
    
    # 2. Ejecutar seeding de administrador
    try:
        from create_admin import seed_admin
        seed_admin()
        logger.info(">>> ADMIN: Seeding verificado.")
    except Exception as e:
        logger.error(f">>> ERROR ADMIN: Fallo en el seeding: {e}")
        
    yield
    logger.info(">>> APAGADO: Cerrando servidor.")

app = FastAPI(
    title="Corales API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allow_origins = [FRONTEND_URL, "https://corales-omega.vercel.app", "http://127.0.0.1:3000"]
if settings.ENVIRONMENT in ["development", "local"]:
    allow_origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ENDPOINTS DE SALUD (Mínimos para Railway) ---
@app.get("/")
def read_root():
    return {"status": "CoralApp API Active", "build": "v3.2.0_debug"}

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "3.2.0"}

# API Routes
app.include_router(api_router, prefix="/api/v1")
