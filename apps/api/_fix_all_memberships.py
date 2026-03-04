import uuid
from core.database import SessionLocal
from models.user import User
from models.choir import Choir, Membership, VoicePart

db = SessionLocal()

choir = db.query(Choir).first()
if not choir:
    print("No choirs found")
    exit()

users = db.query(User).all()
for u in users:
    mem = db.query(Membership).filter_by(user_id=u.id, choir_id=choir.id).first()
    if not mem:
        print(f"Adding membership for {u.email}")
        role = VoicePart.DIRECTOR if u.role in ["DIRECTOR", "ADMIN"] else VoicePart.SOPRANO
        mem = Membership(
            id=str(uuid.uuid4()),
            user_id=u.id,
            choir_id=choir.id,
            voice_part=role
        )
        db.add(mem)

db.commit()
print("All users added to first choir.")
