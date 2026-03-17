import asyncio
from app.db.session import SessionLocal
from app.models.academy import AcademyUnit, AcademyExercise

async def check():
    db = SessionLocal()
    units = db.query(AcademyUnit).all()
    exercises = db.query(AcademyExercise).all()
    print(f"Units: {len(units)}")
    for u in units:
        print(f"  Unit: {u.title} (Order: {u.order})")
    print(f"Exercises: {len(exercises)}")
    db.close()

if __name__ == "__main__":
    asyncio.run(check())
