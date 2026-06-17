from sqlalchemy import Column, Integer, String
from database import Base

class EcoAction(Base):
    __tablename__ = "eco_actions"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    action = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)