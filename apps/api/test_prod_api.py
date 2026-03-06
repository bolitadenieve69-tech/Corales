import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal
from models.user import User
from core.security import create_access_token
import requests

def test_api():
    db = SessionLocal()
    try:
        # Get the admin user
        admin = db.query(User).filter(User.role == "ADMIN").first()
        if not admin:
            print("No admin user found")
            return
            
        print(f"Testing as {admin.email}")
        
        # Generate token
        token = create_access_token(data={"sub": str(admin.id)})
        
        # Call API
        headers = {"Authorization": f"Bearer {token}"}
        url = "https://corales-production.up.railway.app/api/v1/works/?skip=0&limit=5"
        
        print(f"Calling: {url}")
        res = requests.get(url, headers=headers)
        
        print(f"Status: {res.status_code}")
        try:
            print(res.json())
        except:
            print(res.text)
            
    finally:
        db.close()

if __name__ == "__main__":
    test_api()
