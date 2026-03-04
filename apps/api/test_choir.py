from fastapi.testclient import TestClient
from main import app
from core.database import SessionLocal
from models.user import User
from models.choir import Membership

db = SessionLocal()
user = db.query(User).filter_by(email="director@prueba.com").first()

client = TestClient(app)
import api.deps as deps
app.dependency_overrides[deps.get_current_active_director] = lambda: user

resp = client.put("/api/v1/choirs/me", json={"name": "New Name"})
print(resp.status_code)
print(resp.json())
