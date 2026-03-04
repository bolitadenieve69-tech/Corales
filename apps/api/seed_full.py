import sys
import os
import uuid
import pandas as pd
from sqlalchemy.orm import Session

# Add the app directory to the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from core.security import get_password_hash
from models.user import User, UserRole
from models.choir import Choir, Membership, VoicePart
from models.work import Work

def seed_everything(db: Session):
    try:
        print("SEEDING: Checking/Creating Admin...")
        admin = db.query(User).filter_by(email="admin@corales.com").first()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                email="admin@corales.com",
                hashed_password=get_password_hash("password123"),
                full_name="Administrador",
                role=UserRole.ADMIN
            )
            db.add(admin)
        
        print("SEEDING: Checking/Creating Test Director...")
        director = db.query(User).filter_by(email="director@prueba.com").first()
        if not director:
            director = User(
                id=str(uuid.uuid4()),
                email="director@prueba.com",
                hashed_password=get_password_hash("123456"),
                full_name="Ángel Director",
                role=UserRole.DIRECTOR
            )
            db.add(director)
        
        print("SEEDING: Checking/Creating Test Choir...")
        choir = db.query(Choir).filter_by(name="Coro de Prueba").first()
        if not choir:
            choir = Choir(
                id=str(uuid.uuid4()),
                name="Coro de Prueba",
                description="Coro demo para testing",
                max_users=100
            )
            db.add(choir)
            
        db.commit()
        db.refresh(director)
        db.refresh(choir)

        print("SEEDING: Checking/Creating Memberships...")
        mem1 = db.query(Membership).filter_by(user_id=director.id, choir_id=choir.id).first()
        if not mem1:
            m = Membership(
                id=str(uuid.uuid4()),
                user_id=director.id,
                choir_id=choir.id,
                voice_part=VoicePart.DIRECTOR
            )
            db.add(m)
            
        # Also assign admin just in case
        if admin:
            mem2 = db.query(Membership).filter_by(user_id=admin.id, choir_id=choir.id).first()
            if not mem2:
                m2 = Membership(
                    id=str(uuid.uuid4()),
                    user_id=admin.id,
                    choir_id=choir.id,
                    voice_part=VoicePart.DIRECTOR
                )
                db.add(m2)
                
        db.commit()

        print("SEEDING: Checking/Loading Works...")
        excel_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../06_Metadata/Plan_Biblioteca_Coral_v2_Piloto.xlsx")
        
        if os.path.exists(excel_path):
            df = pd.read_excel(excel_path)
            df = df.dropna(subset=['Título'])
            existing_works = [w.title for w in db.query(Work).filter_by(choir_id=choir.id).all()]
            
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
            print(f"SEEDING: Added {count} new works to {choir.name}'s library.")
        else:
            print("SEEDING: Excel file not found, skipping works.")
            
    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()

if __name__ == "__main__":
    db = SessionLocal()
    seed_everything(db)
    db.close()
