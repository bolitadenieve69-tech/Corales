import logging
from core.database import SessionLocal
from models.user import User, UserRole
from core.security import get_password_hash

logger = logging.getLogger(__name__)

def seed_admin():
    db = SessionLocal()
    try:
        from core.config import settings
        logger.info(f"Iniciando seeding de admin. Base de datos: {settings.DATABASE_URL.split('://')[0]}")
        
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
            logger.info("¡Usuario administrador creado exitosamente!")
        else:
            # FORCE UPDATE password to ensure consistency
            logger.info(f"Actualizando/Verificando contraseña para: {email}")
            user.hashed_password = get_password_hash(password)
            user.role = UserRole.ADMIN # Ensure role is also correct
            db.commit()
            logger.info("Datos de administrador actualizados correctamente.")
    except Exception as e:
        logger.error(f"ERROR CRÍTICO EN SEED_ADMIN: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    seed_admin()
