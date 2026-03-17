import sys
import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the current directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from core.config import settings
from models.user import User, UserRole
from models.choir import Choir, Membership, VoicePart

def seed():
    # Use the URL from settings
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        email = "director@coro.com"
        # HASH for Corales2026!
        hashed_password = "$2b$12$I1S3tqxkskhUmdU0rKLI8OkSPFDEK.JUXbWTMRfvwD.lwRHZK0qkS"
        
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"Creando usuario: {email}")
            user_id = str(uuid.uuid4())
            user = User(
                id=user_id,
                email=email,
                hashed_password=hashed_password,
                full_name="Director de Coro",
                role=UserRole.DIRECTOR
            )
            db.add(user)
            db.flush()
        
        membership = db.query(Membership).filter(Membership.user_id == user.id).first()
        if not membership:
            print("Creando coro...")
            choir_id = str(uuid.uuid4())
            choir = Choir(
                id=choir_id,
                name="Coro Principal",
                description="Mi primer coro en Corales"
            )
            db.add(choir)
            db.flush()
            
            membership = Membership(
                id=str(uuid.uuid4()),
                user_id=user.id,
                choir_id=choir.id,
                voice_part=VoicePart.DIRECTOR
            )
            db.add(membership)
        
        db.commit()
        print("¡Seeding completado con éxito!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
