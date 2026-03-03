from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from core import security
from core.config import settings
from core.database import get_db
from models.user import User
from schemas.token import Token

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    username = form_data.username.lower().strip()
    user = db.query(User).filter(User.email == username).first()
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

@router.get("/auth-check")
def auth_check(db: Session = Depends(get_db)):
    """
    Endpoint temporal de diagnóstico.
    """
    from create_admin import seed_admin
    from models.user import User
    
    # 1. Forzar seeding
    seed_admin()
    
    # 2. Verificar
    admin = db.query(User).filter(User.email == "admin@corales.com").first()
    password_ok = False
    if admin:
        password_ok = security.verify_password("password123", admin.hashed_password)
        
    return {
        "admin_found": admin is not None,
        "password_ok": password_ok,
        "users_count": db.query(User).count(),
        "tag": "v3.0.0_final"
    }
