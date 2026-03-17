from fastapi.testclient import TestClient
from main import app
from core.database import SessionLocal
from models.user import User

db = SessionLocal()
admin = db.query(User).filter_by(role="ADMIN").first()

client = TestClient(app)
import api.deps as deps
app.dependency_overrides[deps.get_current_active_user] = lambda: admin

resp = client.get("/api/v1/works/")
print("Status:", resp.status_code)
data = resp.json()
print("Returned items:", len(data))
db.close()
