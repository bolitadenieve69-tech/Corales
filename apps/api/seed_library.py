import os
import sys
import pandas as pd
import uuid

# Set up paths to import from apps.api
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from models.choir import Choir
from models.work import Work

def load_excel():
    excel_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../06_Metadata/Plan_Biblioteca_Coral_v2_Piloto.xlsx")
    if not os.path.exists(excel_path):
        print(f"File not found: {excel_path}")
        return
        
    df = pd.read_excel(excel_path)
    
    # Filter rows that have an actual title
    df = df.dropna(subset=['Título'])
    
    db = SessionLocal()
    
    try:
        # Get target choir
        choir = db.query(Choir).first()
        if not choir:
            print("No choir found to attach library to!")
            return
            
        print(f"Attaching {len(df)} works to choir {choir.name}...")
        
        # Keep track of added to avoid duplicates if run multiple times
        existing_works = [w.title for w in db.query(Work).filter(Work.choir_id == choir.id).all()]
        count = 0
        
        for _, row in df.iterrows():
            title = str(row['Título']).strip()
            if title in existing_works:
                continue
                
            work = Work(
                id=str(uuid.uuid4()),
                title=title,
                composer=str(row['Autor/Origen']) if pd.notna(row['Autor/Origen']) else "Anónimo",
                era=str(row['Época']) if pd.notna(row['Época']) else None,
                genre=str(row['Colección']) if pd.notna(row['Colección']) else None,
                voice_format=str(row['Voces']) if pd.notna(row['Voces']) else None,
                accompaniment=str(row['Acompañamiento']) if pd.notna(row['Acompañamiento']) else None,
                language=str(row['Idioma']) if pd.notna(row['Idioma']) else None,
                difficulty=str(row['Dificultad']) if pd.notna(row['Dificultad']) else None,
                choir_id=choir.id
            )
            db.add(work)
            count += 1
            existing_works.append(title)
            
        db.commit()
        print(f"Successfully added {count} new works to {choir.name}'s library.")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    load_excel()
