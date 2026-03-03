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
    return {"status": "ok", "version": "1.0.0", "environment": settings.ENVIRONMENT}

@app.get("/debug-auth")
def debug_auth():
    """
    Endpoint temporal para forzar la creación del admin y verificar el estado de la BD.
    SOPORTE TÉCNICO: Solo usar si el login falla tras el despliegue.
    """
    from create_admin import seed_admin
    from core.database import SessionLocal
    from models.user import User
    
    db = SessionLocal()
    try:
        # 1. Intentar forzar seeding
        seed_admin()
        
        # 2. Verificar estado actual
        users_count = db.query(User).count()
        admin = db.query(User).filter(User.email == "admin@corales.com").first()
        
        password_check = False
        if admin:
            from core.security import verify_password
            password_check = verify_password("password123", admin.hashed_password)
        
        return {
            "status": "diagnostic_complete",
            "users_in_db": users_count,
            "admin_found": admin is not None,
            "password_is_correct": password_check,
            "hint": "Si password_is_correct es False, el seeding no se aplicó bien.",
            "db_type": settings.DATABASE_URL.split("://")[0]
        }
    except Exception as e:
        logger.error(f"Fallo en diagnóstico: {e}")
        return {"error": str(e)}
    finally:
        db.close()
