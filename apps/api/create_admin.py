import sys
import os

sys.path.append(os.path.join(os.getcwd(), "apps/api"))

from core.database import SessionLocal
from models.user import User, UserRole
from core.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        email = "admin@corales.com"
        password = "password123"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                full_name="Admin",
                hashed_password=get_password_hash(password),
                role=UserRole.ADMIN
            )
            db.add(user)
            db.commit()
            print(f"Usuario admin creado exitosamente: {email} / {password}")
        else:
             user.hashed_password = get_password_hash(password)
             db.commit()
             print(f"El usuario {email} ya existía. La contraseña se reinició a: {password}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
