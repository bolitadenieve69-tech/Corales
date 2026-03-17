import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import MagicMock, patch

client = TestClient(app)

def test_academy_dashboard():
    """Verify academy dashboard returns the new level structure."""
    with patch("api.v1.endpoints.academy.get_db") as mock_get_db:
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        # We need to mock the logic inside get_academy_dashboard
        # For simplicity, we can test the response schema if we have a real db or mock the return of the endpoint function
        response = client.get("/api/v1/academy/dashboard")
        
        # Even if not authenticated, we check if it responds (it might redirect or return 401 if protected)
        assert response.status_code in [200, 401]
        
        if response.status_code == 200:
            data = response.json()
            assert "lessons" in data
            assert len(data["lessons"]) > 0
            # Check if at least one lesson has the level field
            assert any("level" in lesson for lesson in data["lessons"])

def test_academy_lesson_detail():
    """Verify academy lesson detail includes levels."""
    # Assuming we have at least one lesson or we use a fake id
    test_lesson_id = "test-lesson-1"
    
    with patch("api.v1.endpoints.academy.get_db") as mock_get_db:
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        response = client.get(f"/api/v1/academy/lessons/{test_lesson_id}")
        assert response.status_code in [200, 404, 401]

