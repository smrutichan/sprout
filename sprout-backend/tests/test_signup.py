import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Sprout Backend Running"

def test_pet():
    response = client.get("/pet")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "energy" in data
    assert "happiness" in data
    assert "level" in data

def test_world():
    response = client.get("/world")
    assert response.status_code == 200
    data = response.json()
    assert "forest" in data
    assert "river" in data

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

def test_login_invalid():
    response = client.post(
        "/login",
        json={
            "email":"fake@gmail.com",
            "password":"wrongpass"
        }
    )

    assert response.status_code == 200
    assert "error" in response.json()

def test_login_success():
    client.post(
        "/signup",
        json={
            "name":"loginuser",
            "email":"login@test.com",
            "password":"12345678"
        }
    )

    response = client.post(
        "/login",
        json={
            "email":"login@test.com",
            "password":"12345678"
        }
    )

    assert response.status_code == 200
    assert "token" in response.json()

def test_signup_short_password():
    response = client.post(
        "/signup",
        json={
            "name":"test",
            "email":"short@test.com",
            "password":"123"
        }
    )

    assert response.status_code == 200
    assert "error" in response.json()
