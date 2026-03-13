
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from core.config import settings

def decode_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a Supabase JWT token using the JWT secret.
    """
    if not settings.SUPABASE_JWT_SECRET:
        return None
    
    try:
        # Supabase tokens are standard HS256 JWTs signed with the project's JWT Secret
        payload = jwt.decode(
            token, 
            settings.SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            audience="authenticated"
        )
        return payload
    except JWTError:
        return None

def get_user_id_from_any_token(token: str) -> Optional[str]:
    """
    Tries to get a user ID from a token, checking both internal and Supabase formats.
    """
    # 1. Try Internal JWT
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return str(payload.get("sub"))
    except JWTError:
        pass
    
    # 2. Try Supabase JWT
    supabase_payload = decode_supabase_token(token)
    if supabase_payload:
        # Supabase uses 'sub' for the user UUID
        return str(supabase_payload.get("sub"))
    
    return None
