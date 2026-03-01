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
        # Check if user already exists
        email = "director@coro.com"
        password = "Corales2026!"
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creando usuario administrativo: {email}")
            user_obj = User(
                id=str(uuid.uuid4()),
                email=email,
                hashed_password=get_password_hash(password),
                full_name="Director de Coro",
                role=UserRole.DIRECTOR
            )
            db.add(user_obj)
            
            # Create default choir
            print("Creando coro predeterminado...")
            choir = Choir(
                id=str(uuid.uuid4()),
                name="Coro Principal",
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
            print("¡Usuario creado exitosamente!")
            print(f"Email: {email}")
            print(f"Password: {password}")
        if not user:
            # ... (creation logic remains same)
            # (already updated in previous step)
            pass
        else:
            print(f"El usuario {email} ya existe. Comprobando coros...")
            membership = db.query(Membership).filter(Membership.user_id == user.id).first()
            if not membership:
                print("El usuario no tiene coro. Creando uno...")
                choir = Choir(
                    id=str(uuid.uuid4()),
                    name="Coro Principal",
                    description="Mi primer coro en Corales"
                )
                db.add(choir)
                membership = Membership(
                    id=str(uuid.uuid4()),
                    user_id=user.id,
                    choir_id=choir.id,
                    voice_part=VoicePart.DIRECTOR
                )
                db.add(membership)
                db.commit()
                print("Coro creado para el usuario existente.")
            else:
                print(f"El usuario ya pertenece al coro: {membership.choir.name}")
    except Exception as e:
        print(f"Error al crear el usuario: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_user()
