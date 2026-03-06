import os
import sys
import csv
import uuid
from sqlalchemy.orm import Session
from models.work import Work
from models.edition import Edition
from models.asset import Asset
from models.user import User

def seed_csv_library(db: Session):
    """
    Seeds the global catalog from the 3 CSV files located in apps/api/data/
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "data")
    
    files = [
        "obras_corales_final.csv",
        "obras_trujillo_nuevas.csv",
        "obras_corales_extra.csv"
    ]
    
    # 1. Ensure we have an admin or at least a reference point if needed,
    # but these are global works (choir_id=None).
    
    # Get existing works to avoid duplicates
    existing_works = {
        (w.title.strip().lower(), w.composer.strip().lower() if w.composer else "")
        for w in db.query(Work).filter(Work.choir_id == None).all()
    }
    
    print(f"DEBUG: Found {len(existing_works)} existing global works.")
    
    total_added = 0
    
    for filename in files:
        file_path = os.path.join(data_dir, filename)
        if not os.path.exists(file_path):
            print(f"WARNING: File not found {file_path}")
            continue
            
        print(f"PROCESSING: {filename}")
        with open(file_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            # Handle potential BOM or different headers if necessary
            # For these 3 files, the headers are fairly consistent
            
            for row in reader:
                # Get fields with fallbacks for different CSV formats
                title = (row.get("titulo") or row.get("title") or "").strip()
                composer = (row.get("compositor") or row.get("composer") or "Anónimo").strip()
                
                if not title:
                    continue
                    
                key = (title.lower(), composer.lower())
                if key in existing_works:
                    continue
                
                era = row.get("era") or row.get("Época") or "Por definir"
                genre = row.get("genre") or row.get("Colección") or row.get("Género") or "General"
                voices = row.get("voces") or row.get("Voces")
                
                work = Work(
                    id=uuid.uuid4().hex,
                    title=title,
                    composer=composer,
                    era=era,
                    genre=genre,
                    voice_format=voices,
                    choir_id=None
                )
                db.add(work)
                db.flush()
                
                # Add IMSLP/CPDL links if present (common in extra.csv)
                for source in ["imslp", "cpdl"]:
                    url = row.get(f"url_{source}")
                    if url and url.strip():
                        def_edition = Edition(
                            id=uuid.uuid4().hex,
                            work_id=work.id,
                            source=source.upper(),
                            publisher=source.upper()
                        )
                        db.add(def_edition)
                        db.flush()
                        
                        asset = Asset(
                            id=uuid.uuid4().hex,
                            edition_id=def_edition.id,
                            asset_type="EXTERNAL_LINK",
                            file_url=url.strip(),
                            original_filename=f"{title} - {source.upper()}"
                        )
                        db.add(asset)

                existing_works.add(key)
                total_added += 1
                
    db.commit()
    print(f"SUCCESS: Added {total_added} works to the global catalog.")
    return total_added

if __name__ == "__main__":
    from core.database import SessionLocal
    db = SessionLocal()
    seed_csv_library(db)
    db.close()
