from core.database import SessionLocal
from models.user import User
from models.choir import Choir, Membership
from models.work import Work

db = SessionLocal()

print("USERS:")
for u in db.query(User).all():
    print(f"- {u.email} (Role: {u.role})")

print("\nCHOIRS:")
for c in db.query(Choir).all():
    print(f"- {c.id}: {c.name}")

print("\nMEMBERSHIPS:")
for m in db.query(Membership).all():
    user = db.query(User).filter_by(id=m.user_id).first()
    choir = db.query(Choir).filter_by(id=m.choir_id).first()
    print(f"- User: {user.email if user else 'Unknown'}, Choir: {choir.name if choir else 'Unknown'}, Role: {m.voice_part}")

print("\nWORKS:")
works = db.query(Work).all()
print(f"Total works: {len(works)}")
if len(works) > 0:
    for w in works[:5]:
        choir = db.query(Choir).filter_by(id=w.choir_id).first()
        print(f"- {w.title} (Choir: {choir.name if choir else 'Unknown'})")

db.close()
