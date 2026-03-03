import sys
import os

sys.path.append(os.path.join(os.getcwd(), "apps/api"))

from core.database import SessionLocal
from models.user import User, UserRole
from models.choir import Choir, Membership, VoicePart
from core.security import get_password_hash

def seed_test_user():
    db = SessionLocal()
    try:
        email = "test@corales.com"
        password = "password123"
        
        # 1. Get or create a choir
        choir = db.query(Choir).first()
        if not choir:
            choir = Choir(name="Coro de Pruebas")
            db.add(choir)
            db.commit()
            db.refresh(choir)
            
        # 2. Get or create user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                full_name="Coralista de Prueba",
                hashed_password=get_password_hash(password),
                role=UserRole.CORALISTA
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
             user.hashed_password = get_password_hash(password)
             db.commit()

        # 3. Ensure membership exists
        membership = db.query(Membership).filter(
            Membership.user_id == user.id,
            Membership.choir_id == choir.id
        ).first()
        
        if not membership:
            membership = Membership(
                user_id=user.id,
                choir_id=choir.id,
                voice_part=VoicePart.SOPRANO
            )
            db.add(membership)
            db.commit()
            
        print(f"Usuario coralista creado/actualizado:")
        print(f"Email: {email}")
        print(f"Contraseña: {password}")
        print(f"Coro asignado: {choir.name}")

    finally:
        db.close()

if __name__ == "__main__":
    seed_test_user()
