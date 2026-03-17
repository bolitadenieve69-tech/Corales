from core.database import SessionLocal
from models.user import User
from models.choir import Choir, Membership
from models.work import Work

db = SessionLocal()

print("Admin user:")
admin = db.query(User).filter_by(role="ADMIN").first()
if admin:
    print(admin.email)
    mems = db.query(Membership).filter_by(user_id=admin.id).all()
    print([m.choir_id for m in mems])
else:
    print("No admin found")

print("All works:")
print(db.query(Work).count())

db.close()
