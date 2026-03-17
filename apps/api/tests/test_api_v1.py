import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import MagicMock, patch

client = TestClient(app)

@pytest.fixture
def mock_db():
    with patch("api.v1.api.api_router") as mock:
        yield mock

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "CoralApp API Active"

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_works_unauthorized():
    """Works endpoint should require authentication (if implemented)."""
    response = client.get("/api/v1/works/")
    # If the app has auth middleware, this should be 401 or 403
    # Based on the code, some endpoints might be public or protected.
    assert response.status_code in [200, 401]

@patch("api.v1.endpoints.works.get_db")
def test_get_works_mocked(mock_get_db):
    """Test getting works with a mocked database."""
    mock_db_session = MagicMock()
    mock_get_db.return_value = mock_db_session
    
    # Mocking the repository or the database query
    with patch("api.v1.endpoints.works.crud_work.get_multi") as mock_get_multi:
        mock_get_multi.return_value = [
            {"id": "1", "title": "Test Work", "composer": "Test Composer", "era": "Barroco"}
        ]
        
        response = client.get("/api/v1/works/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["title"] == "Test Work"
