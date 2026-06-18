from database import engine, Base
from models.user import User
from models.eco_action import EcoAction
from models.streak import Streak

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")