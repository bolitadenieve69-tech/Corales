import uuid
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from models.user import User
from models.choir import Choir, Membership, VoicePart

db = SessionLocal()

def fix_membership():
    # Find director user
    director = db.query(User).filter_by(email="director@corales.app").first()
    if not director:
        print("Director user not found! Looking for any user...")
        director = db.query(User).first()
        if not director:
            print("No users found")
            return
            
    # Find existing choir
    choir = db.query(Choir).first()
    if not choir:
        print("No choirs found")
        return
        
    print(f"Found User: {director.email}")
    print(f"Found Choir: {choir.name}")
    
    # Check membership
    mem = db.query(Membership).filter_by(user_id=director.id, choir_id=choir.id).first()
    if not mem:
        print("Creating membership...")
        mem = Membership(
            id=str(uuid.uuid4()),
            user_id=director.id,
            choir_id=choir.id,
            voice_part=VoicePart.DIRECTOR
        )
        db.add(mem)
        db.commit()
        print("Membership created!")
    else:
        print("Membership already exists.")
        
if __name__ == "__main__":
    fix_membership()
