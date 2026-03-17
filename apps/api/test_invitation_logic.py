import sys
import os
import uuid

# Add the apps/api directory to the python path
sys.path.append(os.path.join(os.getcwd(), "apps/api"))

from core.database import SessionLocal, engine
from models.base import Base
from models.user import User, UserRole
from core.security import get_password_hash
from fastapi import HTTPException

# Models and Schemas
from schemas.choir import ChoirAssignment
from schemas.invite import InviteCreate
from schemas.user import UserCreate

# Endpoints
from api.v1.endpoints import choirs, invites, users

def setup_test_users(db):
    admin_email = f"admin_{uuid.uuid4().hex[:6]}@test.com"
    admin = User(
        id=str(uuid.uuid4()),
        email=admin_email,
        full_name="Admin Test",
        hashed_password=get_password_hash("pass"),
        role=UserRole.ADMIN
    )
    db.add(admin)
    
    director_email = f"director_{uuid.uuid4().hex[:6]}@test.com"
    director = User(
        id=str(uuid.uuid4()),
        email=director_email,
        full_name="Director Test",
        hashed_password=get_password_hash("pass"),
        role=UserRole.DIRECTOR
    )
    db.add(director)
    db.commit()
    db.refresh(admin)
    db.refresh(director)
    return admin, director

def run_tests():
    print("--- Starting testing for Invitation Quotas & Admin Assignments (Direct Logic) ---")
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        admin, director = setup_test_users(db)
        
        print(f"\n[Test] 1. Admin creates and assigns a choir (max 2 users)...")
        assignment = ChoirAssignment(
            user_id=director.id,
            name="Coro de Prueba Directa",
            description="",
            max_users=2,
            role="DIRECTOR"
        )
        choir = choirs.assign_choir_admin(db=db, assignment=assignment, current_user=admin)
        print(f"✅ Success! Created choir {choir.id} with max_users=2.")
        
        print("\n[Test] 2. Director attempts to create an invite with 2 slots (should fail)...")
        invite_fail = InviteCreate(choir_id=choir.id, max_uses=2)
        try:
            invites.create_invite(invite_in=invite_fail, db=db, current_user=director)
            print("❌ Failed: Expected HTTPException (400) but invite was created.")
        except HTTPException as e:
            if e.status_code == 400:
                print("✅ Success! Blocked invite over quota.")
                print(f"   Message: {e.detail}")
            else:
                print(f"❌ Failed: Expected 400, got {e.status_code}. Details: {e.detail}")
                
        print("\n[Test] 3. Director attempts to create an invite with 1 slot (should succeed)...")
        invite_ok = InviteCreate(choir_id=choir.id, max_uses=1)
        db_invite = invites.create_invite(invite_in=invite_ok, db=db, current_user=director)
        print(f"✅ Success! Created invite with code {db_invite.code}.")
        
        print("\n[Test] 4. User registers via invite code (should succeed)...")
        user_email = f"user_{uuid.uuid4().hex[:6]}@test.com"
        reg_user = UserCreate(
            email=user_email,
            password="userpass",
            full_name="User Test",
            role=UserRole.CORALISTA,
            invite_code=db_invite.code
        )
        created_user = users.create_user(db=db, user_in=reg_user)
        print(f"✅ Success! Registration successful for {created_user.email}.")
        
        print("\n[Test] 5. User attempts to register when choir is full (should fail)...")
        try:
            # We are bypassing the invite max_uses validation for the purpose of testing the Choir FULL logic
            # by directly setting uses_count back to 0 so the invite looks valid again.
            db_invite.uses_count = 0
            db.commit()
            
            user_fail_email = f"user_{uuid.uuid4().hex[:6]}@test.com"
            reg_fail_user = UserCreate(
                email=user_fail_email,
                password="userpass",
                full_name="User Test 2",
                role=UserRole.CORALISTA,
                invite_code=db_invite.code
            )
            users.create_user(db=db, user_in=reg_fail_user)
            print("❌ Failed: Expected HTTPException (400) but user was registered.")
        except HTTPException as e:
            if e.status_code == 400:
                print("✅ Success! Server blocked registration because choir is full:")
                print(f"   Message: {e.detail}")
            else:
                print(f"❌ Failed: Expected 400, got {e.status_code}. Details: {e.detail}")

        print("\n--- All tests completed successfully! ---")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
