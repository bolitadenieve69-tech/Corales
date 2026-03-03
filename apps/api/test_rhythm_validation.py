import sys
import os
import uuid

sys.path.append(os.path.join(os.getcwd(), "apps/api"))

from core.database import SessionLocal
from schemas.academy import RhythmValidationRequest
from api.v1.endpoints import academy
from models.user import User

def run_tests():
    db = SessionLocal()
    try:
        # 1. Ensure seed data is present
        academy.ensure_initial_lessons(db)
        
        # 2. Grab the seeded exercise
        from models.academy import AcademyExercise
        exercise = db.query(AcademyExercise).first()
        if not exercise:
            print("❌ No exercise found to test.")
            return

        print(f"Testing Exercise: {exercise.prompt}")
        print(f"Expected intervals: {exercise.solution['expected_intervals_ms']}")
        
        # Dummy user
        dummy_user = User(id="test_user")
        
        # Test A: Perfect Timing
        print("\n--- Test A: Perfect Timing ---")
        req_perfect = RhythmValidationRequest(intervals_ms=[1000, 1000, 1000])
        res_perfect = academy.validate_exercise(exercise.id, req_perfect, db, dummy_user)
        print(f"Score: {res_perfect.score}%, Passed: {res_perfect.passed}, Feedback: {res_perfect.feedback}")
        assert res_perfect.score == 100
        
        # Test B: Slightly Off Timing (e.g. 50ms late/early) -> Should still pass > 80%
        print("\n--- Test B: Acceptable Timing (±50ms) ---")
        req_ok = RhythmValidationRequest(intervals_ms=[1050, 950, 1020])
        res_ok = academy.validate_exercise(exercise.id, req_ok, db, dummy_user)
        print(f"Score: {res_ok.score}%, Passed: {res_ok.passed}, Feedback: {res_ok.feedback}")
        assert res_ok.passed == True
        
        # Test C: Bad Timing (e.g. wildly off by 500ms) -> Should fail < 80%
        print("\n--- Test C: Bad Timing ---")
        req_bad = RhythmValidationRequest(intervals_ms=[1500, 500, 800])
        res_bad = academy.validate_exercise(exercise.id, req_bad, db, dummy_user)
        print(f"Score: {res_bad.score}%, Passed: {res_bad.passed}, Feedback: {res_bad.feedback}")
        assert res_bad.passed == False
        
        # Test D: Wrong number of notes
        print("\n--- Test D: Wrong note count ---")
        req_wrong_count = RhythmValidationRequest(intervals_ms=[1000, 1000])
        res_wrong_count = academy.validate_exercise(exercise.id, req_wrong_count, db, dummy_user)
        print(f"Score: {res_wrong_count.score}%, Passed: {res_wrong_count.passed}, Feedback: {res_wrong_count.feedback}")
        assert res_wrong_count.passed == False
        assert res_wrong_count.score == 0

        print("\n✅ All validation tests passed!")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
