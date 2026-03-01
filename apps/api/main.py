from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Corales API",
    description="API para la gestión de coros y progreso de estudio",
    version="1.0.0"
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
