from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from models import User
from core.database import get_db
from core.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login/access-token")

def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user

def get_current_active_director(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != "DIRECTOR" and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="El usuario no tiene suficientes privilegios"
        )
    return current_user

def get_current_active_admin(current_user: User = Depends(get_current_active_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Acceso restringido a administradores"
        )
    return current_user

def check_choir_access(choir_id: str, user_id: str, db: Session, required_role: str = None):
    """
    Utility to verify if a user belongs to a choir.
    If required_role is "DIRECTOR", it checks if the user has that voice_part.
    """
    from models.choir import Membership
    membership = db.query(Membership).filter(
        Membership.choir_id == choir_id,
        Membership.user_id == user_id
    ).first()

    if not membership:
        return False
    
    if required_role == "DIRECTOR":
        return membership.voice_part == "DIRECTOR"
    
    return True
