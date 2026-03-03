from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
import sys

# Minimal logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

app = FastAPI(title="Corales API DEBUG", version="3.3.0")

# Simplified CORS
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
        "status": "CoralApp API is Running!",
        "version": "3.3.0_MINIMAL",
        "message": "If you see this, the deployment finally worked."
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "3.3.0"}

# Include routers - we keep them but migrations won't run automatically
from api.v1.api import api_router
app.include_router(api_router, prefix="/api/v1")
