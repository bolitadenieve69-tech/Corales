import sys
import os

# Add the current directory to sys.path to import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from sqlalchemy.orm import Session
from core.database import SessionLocal
from core.security import get_password_hash
from models.user import User, UserRole
from models.choir import Choir, Membership, VoicePart
import uuid

def seed_user():
    db = SessionLocal()
    try:
        # 1. Admin account (for compatibility with user expectation)
        admin_email = "admin@corales.com"
        admin_pass = "password123"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            print(f"Creando usuario admin: {admin_email}")
            new_admin = User(
                id=str(uuid.uuid4()),
                email=admin_email,
                hashed_password=get_password_hash(admin_pass),
                full_name="Usuario Admin",
                role=UserRole.ADMIN
            )
            db.add(new_admin)
            print(f"Admin creado: {admin_email}")

        # 2. Backup director account
        email = "director@coro.com"
        password = "Corales2026!"
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creando usuario respaldo: {email}")
            user_obj = User(
                id=str(uuid.uuid4()),
                email=email,
                hashed_password=get_password_hash(password),
                full_name="Director de Respaldo",
                role=UserRole.DIRECTOR
            )
            db.add(user_obj)
            
            # Create default choir
            print("Creando coro predeterminado...")
            choir = Choir(
                id=str(uuid.uuid4()),
                name="Coro Corales",
                description="Mi primer coro en Corales"
            )
            db.add(choir)
            
            # Link user to choir
            membership = Membership(
                id=str(uuid.uuid4()),
                user_id=user_obj.id,
                choir_id=choir.id,
                voice_part=VoicePart.DIRECTOR
            )
            db.add(membership)
            
        db.commit()
        print("¡Seeding de usuarios completado!")
    except Exception as e:
        print(f"Error al crear el usuario: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_user()
