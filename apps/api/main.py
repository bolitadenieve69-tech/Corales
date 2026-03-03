from fastapi import FastAPI
import os
import sys

# TOTAL INDEPENDENCE: No imports from the app code
app = FastAPI(title="Naked Boot", version="4.0.0")

@app.get("/")
def read_root():
    return {
        "status": "NAKED BOOT SUCCESS",
        "ver": "4.0.0_FINAL_TEST",
        "cwd": os.getcwd(),
        "ls": os.listdir(".")
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "ver": "4.0.0"}

# Everything else is commented out to prove the point
# from api.v1.api import api_router
# app.include_router(api_router, prefix="/api/v1")
