from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200

def test_pet():
    response = client.get("/pet")
    assert response.status_code == 200

def test_world():
    response = client.get("/world")
    assert response.status_code == 200

def test_diary():
    response = client.get("/diary")
    assert response.status_code == 200

def test_signup():
    response = client.post(
        "/signup",
        json={
            "name":"tester",
            "email":"tester@example.com",
            "password":"12345678"
        }
    )

    assert response.status_code in [200,400]
