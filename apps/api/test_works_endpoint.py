from fastapi.testclient import TestClient
from main import app
from core.database import SessionLocal
from models.user import User

db = SessionLocal()
user = db.query(User).filter_by(email="director@prueba.com").first()

client = TestClient(app)
import api.deps as deps
app.dependency_overrides[deps.get_current_active_user] = lambda: user

resp = client.get("/api/v1/works/?skip=0&limit=100")
print("Status:", resp.status_code)
data = resp.json()
print("Returned items:", len(data))
if len(data) > 0:
    print(data[0])
db.close()
