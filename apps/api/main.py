import logging
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

VERSION = "7.3.6_FINAL"

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f">>> STARTING Corales API {VERSION}")

    # Create all tables using the CORRECT Base (from models/base.py)
    try:
        from core.database import engine
        from models.base import Base  # THIS is the Base all models inherit from
        # Import all models so they register with Base.metadata
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
        try:
            import models.academy
        except Exception:
            logger.warning(">>> models.academy not available, skipping")
        try:
            import models.practice_progress
        except Exception:
            logger.warning(">>> models.practice_progress not available, skipping")

        Base.metadata.create_all(bind=engine)
        logger.info(">>> DB: All tables created/verified successfully")
    except Exception as e:
        logger.error(">>> DB: Failed to create tables, attempting auto-heal...")
        logger.error(str(e))
        import os
        if os.path.exists("./corales.db"):
            os.remove("./corales.db")
            logger.info(">>> DB: Deleted old corales.db, retrying create_all...")
            Base.metadata.create_all(bind=engine)
            logger.info(">>> DB: Auto-heal successful, tables re-created")

    def run_seed_in_background():
        try:
            from seed_csv_library import seed_csv_library
            from core.database import SessionLocal
            db = SessionLocal()
            seed_csv_library(db)
            db.close()
            logger.info(">>> SEED: CSV Library seed completed successfully in background")
        except Exception as e:
            logger.error(f">>> SEED: Failed to run CSV library seed process: {e}")

    import threading
    threading.Thread(target=run_seed_in_background, daemon=True).start()
    logger.info(">>> SEED: Background seed task started")

    yield
    logger.info(">>> SHUTTING DOWN Corales API")

app = FastAPI(title="Corales API", version=VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
from api.v1.api import api_router
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"status": "CoralApp API Active", "version": VERSION}

@app.get("/health")
def health_check():
    return {"status": "ok", "version": VERSION}

@app.middleware("http")
async def log_errors(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        logger.error(f">>> {request.url.path}: {e}")
        tb = traceback.format_exc()
        logger.error(tb)
        return JSONResponse(status_code=500, content={"detail": "Internal Server Error", "error": str(e), "traceback": tb})
