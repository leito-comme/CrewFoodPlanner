from sqlalchemy import Column, Integer, String
from app.database import Base


class CrewMember(Base):
    __tablename__ = "crew_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    allergies = Column(String, nullable=True)
