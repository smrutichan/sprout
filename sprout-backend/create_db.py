from database import engine, Base
from models.user import User
from models.eco_action import EcoAction
import os

print("CREATE_DB PATH:", os.path.abspath("sprout.db"))

print(Base.metadata.tables.keys())

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")