import sys
import os
import uuid
from sqlalchemy.orm import Session

# Add the app directory to the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from core.security import get_password_hash
from models.user import User, UserRole

def create_user():
    db = SessionLocal()
    try:
        email = "director@coro.com"
        password = "Corales2026!"
        
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"Usuario {email} ya existe. Actualizando contraseña...")
            user.hashed_password = get_password_hash(password)
        else:
            print(f"Creando nuevo usuario: {email}")
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                hashed_password=get_password_hash(password),
                full_name="Director Demo",
                role=UserRole.DIRECTOR
            )
            db.add(user)
        
        db.commit()
        print(f"✅ Usuario {email} listo con contraseña {password}")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_user()
