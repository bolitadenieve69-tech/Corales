import json
import uuid
import os
import sys

# Add current dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from models.work import Work
from models.choir import Choir

def seed_missing_works():
    db = SessionLocal()
    try:
        # Load scores from JSON
        scores_path = os.path.join(os.path.dirname(__file__), '../web/src/data/scores.json')
        if not os.path.exists(scores_path):
            print(f"Scores JSON not found at {scores_path}")
            return

        with open(scores_path, 'r', encoding='utf-8') as f:
            scores = json.load(f)

        # Get existing work titles
        existing_works = {w.title.lower().strip(): w for w in db.query(Work).all()}
        
        # Get test choir (default for these works)
        choir = db.query(Choir).filter_by(name="Coro de Prueba").first()
        choir_id = choir.id if choir else None

        count = 0
        for s in scores:
            title = s['titulo'].strip()
            if title.lower().strip() in existing_works:
                continue
            
            work = Work(
                id=str(uuid.uuid4()),
                title=title,
                composer=s['compositor'] or "Anónimo",
                voice_format=s['voces'],
                choir_id=choir_id
            )
            # Add era if we can guess or if it's there (it's not in the JSON but we can add logic later)
            db.add(work)
            count += 1
        
        db.commit()
        print(f"Imported {count} new works from manager catalog.")
        
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_missing_works()
