import sys
import os

# Add the apps/api directory to the python path
sys.path.append(os.path.join(os.getcwd(), "apps/api"))

from sqlalchemy.orm import Session
from core.database import SessionLocal, engine
from models.base import Base
# Import all models to ensure they are registered with Base.metadata
from models.user import User, UserRole
from models.choir import Choir, Membership, VoicePart
from core.security import get_password_hash
import uuid

def seed_test_data():
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Create Fictional Choir
        choir_name = "Coro de Prueba (Ficticio)"
        choir = db.query(Choir).filter(Choir.name == choir_name).first()
        if not choir:
            choir = Choir(
                id=str(uuid.uuid4()),
                name=choir_name,
                description="Un coro creado para probar el sistema de invitaciones y cuotas.",
                max_users=5 # Small quota for testing
            )
            db.add(choir)
            db.commit()
            db.refresh(choir)
            print(f"Created choir: {choir.name} with quota {choir.max_users}")
        else:
            print(f"Choir {choir_name} already exists.")

        # 2. Create Fictional Director
        email = "director@prueba.com"
        director = db.query(User).filter(User.email == email).first()
        if not director:
            # Using same hash pattern as before for consistency in local tests if bcrypt is tricky
            # But let's try standard hash first
            password = "password123"
            director = User(
                id=str(uuid.uuid4()),
                email=email,
                full_name="Director de Prueba",
                hashed_password=get_password_hash(password),
                role=UserRole.DIRECTOR
            )
            db.add(director)
            db.commit()
            db.refresh(director)
            print(f"Created director: {email} / {password}")
        else:
            print(f"Director {email} already exists.")

        # 3. Associate Director with Choir
        membership = db.query(Membership).filter(
            Membership.user_id == director.id,
            Membership.choir_id == choir.id
        ).first()
        if not membership:
            membership = Membership(
                id=str(uuid.uuid4()),
                user_id=director.id,
                choir_id=choir.id,
                voice_part=VoicePart.DIRECTOR
            )
            db.add(membership)
            db.commit()
            print(f"Associated {email} as director of {choir_name}")
        else:
            print(f"Membership already exists.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_test_data()
