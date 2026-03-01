import sys
import os

# Add the current directory to sys.path to import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from sqlalchemy.orm import Session
from core.database import SessionLocal
from core.security import get_password_hash
from models.user import User, UserRole

def seed_user():
    db = SessionLocal()
    try:
        # Check if user already exists
        email = "director@coro.com"
        password = "Corales2026!"
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creando usuario administrativo: {email}")
            user_obj = User(
                email=email,
                hashed_password=get_password_hash(password),
                full_name="Director de Coro",
                role=UserRole.DIRECTOR
            )
            db.add(user_obj)
            db.commit()
            print("¡Usuario creado exitosamente!")
            print(f"Email: {email}")
            print(f"Password: {password}")
        else:
            print(f"El usuario {email} ya existe.")
    except Exception as e:
        print(f"Error al crear el usuario: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_user()
