from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.crew import CrewMember
from app.schemas.crew import CrewMemberCreate, CrewMemberRead
from app.database import get_db

router = APIRouter(prefix="/crew", tags=["crew"])


@router.post("/", response_model=CrewMemberRead)
def create_crew(member: CrewMemberCreate, db: Session = Depends(get_db)):
    db_member = CrewMember(**member.model_dump())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@router.get("/", response_model=list[CrewMemberRead])
def read_crew(db: Session = Depends(get_db)):
    return db.query(CrewMember).all()
