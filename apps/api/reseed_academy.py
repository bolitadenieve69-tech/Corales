import sys
import os

sys.path.append(os.path.join(os.getcwd(), "apps/api"))

from core.database import SessionLocal
from models.academy import AcademyLesson, AcademyExercise, UserAcademyProgress
from api.v1.endpoints.academy import ensure_initial_lessons

def reseed():
    db = SessionLocal()
    try:
        print("Borrando progreso de usuarios, ejercicios y lecciones antiguas...")
        db.query(UserAcademyProgress).delete()
        db.query(AcademyExercise).delete()
        db.query(AcademyLesson).delete()
        db.commit()
        
        print("Re-sembrando academia con nuevas lecciones de mayor dificultad...")
        ensure_initial_lessons(db)
        print("¡Completado con éxito!")
    finally:
        db.close()

if __name__ == "__main__":
    reseed()
