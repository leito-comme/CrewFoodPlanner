from sqlalchemy import Column, Integer, String, Float
from app.database import Base


class CrewMember(Base):
    __tablename__ = "crew_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    height = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)
    allergies = Column(String, nullable=True)
