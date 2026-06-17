from sqlalchemy.orm import Session
from database import SessionLocal
from models.user import User

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_user(name,email,password):
    db = SessionLocal()
    user = User(name=name,email=email,password=password)

    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user

def get_user_by_email(email):
    db = SessionLocal()

    user = (
        db.query(User).filter(User.email == email).first())

    db.close()
    return user