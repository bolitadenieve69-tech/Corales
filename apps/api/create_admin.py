import logging
from core.database import SessionLocal
from models.user import User, UserRole
from core.security import get_password_hash

logger = logging.getLogger(__name__)

def seed_admin():
    db = SessionLocal()
    try:
        email = "admin@corales.com"
        password = "password123"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            logger.info(f"Creando usuario administrador inicial: {email}")
            user = User(
                email=email,
                full_name="Admin",
                hashed_password=get_password_hash(password),
                role=UserRole.ADMIN
            )
            db.add(user)
            db.commit()
            logger.info("Usuario administrador creado exitosamente.")
        else:
            # Silence update if already exists with correct hash
            logger.info(f"El usuario administrador {email} ya existe.")
    except Exception as e:
        logger.error(f"Error crítico al crear admin inicial: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_admin()
