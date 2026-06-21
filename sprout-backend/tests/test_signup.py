from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200

def test_signup():
    response = client.post(
        "/signup",
        json={
            "name":"test",
            "email":"test@example.com",
            "password":"test123#"
        }
    )

    assert response.status_code in [200,400]
