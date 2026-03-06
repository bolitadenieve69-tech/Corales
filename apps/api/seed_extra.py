import os
import sys
import csv
import uuid

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from models.work import Work
from models.edition import Edition
from models.asset import Asset

CSV_PATH = "/Users/angelguerraiglesias/Documents/AI_Corales/obras_corales_extra.csv"

def seed_extra():
    if not os.path.exists(CSV_PATH):
        print(f"❌ CSV not found: {CSV_PATH}")
        return

    db = SessionLocal()

    try:
        # Read existing global catalog works (choir_id IS NULL) to avoid duplicates
        existing_works = {
            (w.title, w.composer)
            for w in db.query(Work).filter(Work.choir_id == None).all()  # noqa: E711
        }
        print(f"📚 Found {len(existing_works)} existing global catalog works.")

        added = 0
        skipped = 0

        with open(CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)

            for row in reader:
                title = row["titulo"].strip()
                composer = row["compositor"].strip()
                voice_format = row["voces"].strip() if row.get("voces") else None
                genre = row["genre"].strip() if row.get("genre") else None
                era = row["era"].strip() if row.get("era") else None
                url_imslp = row.get("url_imslp", "").strip() or None
                url_cpdl = row.get("url_cpdl", "").strip() or None

                # Skip if already exists
                if (title, composer) in existing_works:
                    skipped += 1
                    continue

                # Create the Work (global catalog: choir_id=None)
                work = Work(
                    id=uuid.uuid4().hex,
                    title=title,
                    composer=composer,
                    voice_format=voice_format,
                    genre=genre,
                    era=era,
                    choir_id=None,  # Global catalog
                )
                db.add(work)
                db.flush()  # Get work.id for FK references

                # Create Edition + Asset for IMSLP (if URL exists)
                if url_imslp:
                    edition_imslp = Edition(
                        id=uuid.uuid4().hex,
                        work_id=work.id,
                        source="IMSLP",
                        publisher="IMSLP",
                    )
                    db.add(edition_imslp)
                    db.flush()

                    asset_imslp = Asset(
                        id=uuid.uuid4().hex,
                        edition_id=edition_imslp.id,
                        asset_type="EXTERNAL_LINK",
                        file_url=url_imslp,
                        original_filename=f"{title} - IMSLP",
                    )
                    db.add(asset_imslp)

                # Create Edition + Asset for CPDL (if URL exists)
                if url_cpdl:
                    edition_cpdl = Edition(
                        id=uuid.uuid4().hex,
                        work_id=work.id,
                        source="CPDL",
                        publisher="CPDL",
                    )
                    db.add(edition_cpdl)
                    db.flush()

                    asset_cpdl = Asset(
                        id=uuid.uuid4().hex,
                        edition_id=edition_cpdl.id,
                        asset_type="EXTERNAL_LINK",
                        file_url=url_cpdl,
                        original_filename=f"{title} - CPDL",
                    )
                    db.add(asset_cpdl)

                existing_works.add((title, composer))
                added += 1

        db.commit()
        print(f"✅ Imported {added} works to global catalog ({skipped} duplicates skipped).")

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_extra()
