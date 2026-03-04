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

# Manual mapping for the 44 rows where Título is NaN
# Format: "Autor/Origen value" -> (title, composer)
MANUAL_TITLE_MAP = {
    "Abendlied J. Rheimberger": ("Abendlied", "J. Rheinberger"),
    "Adeste Fideles Tradicional austríaca": ("Adeste Fideles", "Tradicional austríaca"),
    "Agnus Dei Dante Andreo": ("Agnus Dei", "Dante Andreo"),
    "Alleluia William Boyce": ("Alleluia", "William Boyce"),
    "Aleluya Anonimo": ("Aleluya", "Anónimo"),
    "Anima Christi P. Frisina": ("Anima Christi", "P. Frisina"),
    "Ave María Tomás Luis de Victoria": ("Ave María", "Tomás Luis de Victoria"),
    "Ave Verum W.A. Mozart": ("Ave Verum", "W.A. Mozart"),
    "Benedictus Lorenzo Perosi": ("Benedictus", "Lorenzo Perosi"),
    "Bogoroditze Dievo Sergei Rachmaninov": ("Bogoroditze Dievo", "Sergei Rachmaninov"),
    "Brindis W.A. Mozart": ("Brindis", "W.A. Mozart"),
    "Caballero de Gracia Federico Chueca": ("Caballero de Gracia", "Federico Chueca"),
    "Canticorum Iubilo G. F. Häendel": ("Canticorum Iubilo", "G.F. Händel"),
    "Cerca de tí, Señor Tradicional inglés": ("Cerca de ti, Señor", "Tradicional inglés"),
    "El Rabadán Tradicional Extremadura": ("El Rabadán", "Tradicional de Extremadura"),
    "Gatatumba Popular andalucía": ("Gatatumba", "Popular de Andalucía"),
    "Gaudeamus Igitur Himno universitario": ("Gaudeamus Igitur", "Himno Universitario"),
    "Jota de La Dolores Tomás Bretón": ("Jota de La Dolores", "Tomás Bretón"),
    "Kalinka Tradicionbal rusa": ("Kalinka", "Tradicional rusa"),
    "Kyrie Leónidas Abaris": ("Kyrie", "Leónidas Abaris"),
    "La Borrachita Tata Nacho": ("La Borrachita", "Tata Nacho"),
    "Lacrymosa W.A. Mozart": ("Lacrymosa", "W.A. Mozart"),
    "Locus Iste Anton Bruckner": ("Locus Iste", "Anton Bruckner"),
    "Los Campanilleros Tradicional andalucia": ("Los Campanilleros", "Tradicional de Andalucía"),
    "Manolito Chiquito Tradicional Extremadura": ("Manolito Chiquito", "Tradicional de Extremadura"),
    "Miserere Antonio Lotti": ("Miserere", "Antonio Lotti"),
    "Nocturnos de la Ventana Lorca/Vila": ("Nocturnos de la Ventana", "Lorca/Vila"),
    "O Santíssima Tradicional siciliano": ("O Santíssima", "Tradicional siciliano"),
    "O Tanenbaum Tradicional Alemán": ("O Tannenbaum", "Tradicional alemán"),
    "Pájaro Triguero Jota extremeña": ("Pájaro Triguero", "Jota extremeña"),
    "Panis Angelicus Cesar Franck": ("Panis Angelicus", "César Franck"),
    "Pastores de Extremadura Popular de Extremadura": ("Pastores de Extremadura", "Popular de Extremadura"),
    "Pater Noster Niocolai Kedrov": ("Pater Noster", "Nikolai Kedrov"),
    "Pie Jesu A. Lloyd Webe": ("Pie Jesu", "A. Lloyd Webber"),
    "Sanctus Benedictus Misa KV49 de Mozart": ("Sanctus Benedictus (Misa KV49)", "W.A. Mozart"),
    "Santa María A. Schweisser": ("Santa María", "A. Schweisser"),
    "Salve Rociera Tradicional de Huelva": ("Salve Rociera", "Tradicional de Huelva"),
    "Salve de Covadonga Tradicional de Asturias": ("Salve de Covadonga", "Tradicional de Asturias"),
    "Stabat Mater Zoltan Kodaly": ("Stabat Mater", "Zoltán Kodály"),
    "Stabat Mater D.383 F. Schubert": ("Stabat Mater D.383", "F. Schubert"),
    "Stabat Mater D.175 F. Schubert": ("Stabat Mater D.175", "F. Schubert"),
    "Siyahamba Tradicional Zulú": ("Siyahamba", "Tradicional zulú"),
    "Te llevaré Albert Alcaraz": ("Te llevaré", "Albert Alcaraz"),
    "Ubi Caritas Ola Gjeilo": ("Ubi Caritas", "Ola Gjeilo"),
    "Va pensiero (Coro": ("Va pensiero (Coro de los Esclavos)", "Giuseppe Verdi"),  # special: next col has "Esclavos) Giuseppe Verdi"
}


def parse_row(row):
    """Extract title and composer from any row, handling the NaN título case."""
    titulo = row.get('Título')
    autor = row.get('Autor/Origen', '')

    if pd.notna(titulo):
        title = str(titulo).strip()
        composer = str(autor).strip() if pd.notna(autor) else "Anónimo"
    else:
        # Título is NaN — check manual map first
        autor_str = str(autor).strip() if pd.notna(autor) else ""
        if autor_str in MANUAL_TITLE_MAP:
            title, composer = MANUAL_TITLE_MAP[autor_str]
        elif autor_str:
            # Fallback: use full string as title
            title = autor_str
            composer = "Por determinar"
        else:
            return None, None

    return title, composer


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

        # Assign all other orphaned users to the test choir
        users = db.query(User).all()
        for u in users:
            mem = db.query(Membership).filter_by(user_id=u.id).first()
            if not mem:
                role = VoicePart.DIRECTOR if u.role in [UserRole.DIRECTOR, UserRole.ADMIN] else VoicePart.SOPRANO
                m = Membership(
                    id=str(uuid.uuid4()),
                    user_id=u.id,
                    choir_id=choir.id,
                    voice_part=role
                )
                db.add(m)
        db.commit()

        print("SEEDING: Checking/Loading Works from Excel...")
        # Try multiple possible locations for the Excel file (prefer FIXED version)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        possible_paths = [
            os.path.join(script_dir, "../../06_Metadata/Plan_Biblioteca_Coral_v2_Piloto_FIXED.xlsx"),
            os.path.join(script_dir, "../../06_Metadata/Plan_Biblioteca_Coral_v2_Piloto.xlsx"),
            os.path.join(script_dir, "../06_Metadata/Plan_Biblioteca_Coral_v2_Piloto_FIXED.xlsx"),
            os.path.join(script_dir, "../06_Metadata/Plan_Biblioteca_Coral_v2_Piloto.xlsx"),
            os.path.join(script_dir, "temp_zip/06_Metadata/Plan_Biblioteca_Coral_v2_Piloto_FIXED.xlsx"),
            "/Users/angelguerraiglesias/Documents/AI_Corales/06_Metadata/Plan_Biblioteca_Coral_v2_Piloto_FIXED.xlsx",
            "/Users/angelguerraiglesias/Documents/AI_Corales/06_Metadata/Plan_Biblioteca_Coral_v2_Piloto.xlsx",
        ]
        
        excel_path = None
        for p in possible_paths:
            if os.path.exists(p):
                excel_path = p
                break

        if excel_path:
            df = pd.read_excel(excel_path)
            existing_works = {w.title for w in db.query(Work).filter_by(choir_id=choir.id).all()}

            count = 0
            for _, row in df.iterrows():
                title, composer = parse_row(row)
                if not title or title in existing_works:
                    continue

                work = Work(
                    id=str(uuid.uuid4()),
                    title=title,
                    composer=composer,
                    era=str(row['Época']) if pd.notna(row.get('Época')) else None,
                    genre=str(row['Colección']) if pd.notna(row.get('Colección')) else None,
                    voice_format=str(row['Voces']) if pd.notna(row.get('Voces')) else None,
                    accompaniment=str(row['Acompañamiento']) if pd.notna(row.get('Acompañamiento')) else None,
                    language=str(row['Idioma']) if pd.notna(row.get('Idioma')) else None,
                    difficulty=str(row['Dificultad']) if pd.notna(row.get('Dificultad')) else None,
                    choir_id=choir.id
                )
                db.add(work)
                count += 1
                existing_works.add(title)
            db.commit()
            print(f"SEEDING: Library now has {len(existing_works)} works ({count} new).")
        else:
            print(f"SEEDING: Excel file not found at {excel_path}, skipping works.")

    except Exception as e:
        import traceback
        print(f"Error during seeding: {e}")
        traceback.print_exc()
        db.rollback()


if __name__ == "__main__":
    db = SessionLocal()
    seed_everything(db)
    db.close()
