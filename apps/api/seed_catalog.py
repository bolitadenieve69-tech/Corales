import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
from core.database import SessionLocal, engine
import models
import uuid

# Base models need to be created in the database if it's completely empty
# But Alembic handles the schema. We just ensure it.
# models.Base.metadata.create_all(bind=engine)

def seed():
    excel_path = "temp_zip/06_Metadata/Plan_Biblioteca_Coral_v2_Piloto_FIXED.xlsx"
    if not os.path.exists(excel_path):
        print(f"Error: Could not find Excel file at {excel_path}")
        return

    print("Cargando datos del Excel...")
    df = pd.read_excel(excel_path, engine='openpyxl')
    
    db = SessionLocal()
    try:
        # 1. Ensure a default choir exists
        choir = db.query(models.Choir).first()
        if not choir:
            choir = models.Choir(name="Coro Principal")
            db.add(choir)
            db.commit()
            db.refresh(choir)
            print("Coro por defecto creado.")

        # Limpiar datos anteriores (en cascada)
        db.query(models.Asset).delete()
        db.query(models.Edition).delete()
        db.query(models.Work).delete()
        db.commit()

        # Iterar obras únicas
        unique_works = df.drop_duplicates(subset=['Título', 'Autor/Origen'])
        
        for _, row in unique_works.iterrows():
            title = str(row.get('Título', 'Sin Título')).strip()
            if title == 'nan': continue
            
            composer = str(row.get('Autor/Origen', '')).strip()
            composer = composer if composer != 'nan' else None
            
            work_format = str(row.get('Voces', '')).strip()
            work_format = work_format if work_format != 'nan' else 'SATB'

            # Insert Work
            work = models.Work(
                title=title,
                composer=composer,
                voice_format=work_format,
                choir_id=choir.id
            )
            db.add(work)
            db.commit()
            db.refresh(work)
            
            # Default Edition for the work
            edition = models.Edition(
                work_id=work.id,
                publisher="Midi/PDF Auto",
            )
            db.add(edition)
            db.commit()
            db.refresh(edition)
            
            # In an actual import we'd link each asset file based on rows matching 'Obra'
            # Here we just create a dummy asset to indicate it was registered
            pdf_asset = models.Asset(
                edition_id=edition.id,
                asset_type="pdf",
                file_url="/dummy/path/score.pdf",
                original_filename=f"{title.replace(' ', '_')}.pdf"
            )
            # Add audio asset
            audio_asset = models.Asset(
                edition_id=edition.id,
                asset_type="audio",
                file_url="/dummy/path/tutti.mp3",
                original_filename=f"{title.replace(' ', '_')}_tutti.mp3"
            )
            db.add(pdf_asset)
            db.add(audio_asset)
            db.commit()
            
            print(f"Obra inyectada: {title} ({composer})")

        print("¡Catálogo importado correctamente!")
    except Exception as e:
        print(f"Ocurrió un error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
