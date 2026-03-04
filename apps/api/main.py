import logging
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

VERSION = "7.2.1_STABLE"

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f">>> STARTING Corales API {VERSION}")

    # Create all tables
    try:
        from core.database import engine
        from models.base import Base
        # Import all models so they register with Base
        import models.user
        import models.choir
        import models.work
        import models.edition
        import models.asset
        import models.season
        import models.project
        import models.project_repertoire
        import models.feedback
        import models.invite
        import models.academy
        import models.practice_progress
        Base.metadata.create_all(bind=engine)
        logger.info(">>> DB: Tables created/verified")
    except Exception:
        logger.error(">>> DB: Failed to create tables")
        logger.error(traceback.format_exc())

    # Seed admin user if not exists
    try:
        from core.database import SessionLocal
        from core.security import get_password_hash
        from models.user import User, UserRole
        import uuid

        db = SessionLocal()
        admin = db.query(User).filter(User.email == "admin@corales.com").first()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                email="admin@corales.com",
                hashed_password=get_password_hash("password123"),
                full_name="Administrador",
                role=UserRole.ADMIN
            )
            db.add(admin)
            db.commit()
            logger.info(">>> SEED: Admin user created (admin@corales.com)")
        else:
            logger.info(">>> SEED: Admin user already exists")
        db.close()
    except Exception:
        logger.error(">>> SEED: Failed to seed admin")
        logger.error(traceback.format_exc())

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

# Include main API router
from api.v1.api import api_router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"status": "CoralApp API Active", "version": VERSION}

@app.get("/health")
def health_check():
    return {"status": "ok", "version": VERSION}

@app.get("/api/v1/auth-check")
def auth_check():
    return {"status": "connected", "version": VERSION}

@app.middleware("http")
async def log_errors(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f">>> ERROR: {e}")
        logger.error(traceback.format_exc())
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
