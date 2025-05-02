from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.models.crew import CrewMember
from app.schemas.crew import CrewMemberCreate, CrewMemberRead
from app.database import get_db
import pandas as pd

router = APIRouter(prefix="/crew", tags=["crew"])


@router.post("/add", response_model=CrewMemberRead)
def create_crew(member: CrewMemberCreate, db: Session = Depends(get_db)):
    db_member = CrewMember(**member.model_dump())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@router.post("/upload", response_model=list[CrewMemberRead])
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".xls", ".xlsx")):
        raise HTTPException(status_code=400, detail="Invalid file type!")

    contents = await file.read()
    df = pd.read_excel(contents)

    required_columns = {"name", "height", "weight", "allergies"}
    if not required_columns.issubset(df.columns):
        raise HTTPException(
            status_code=400, detail=f"Probably missed columns: {required_columns}"
        )

    for _, row in df.iterrows():
        member = CrewMember(
            name=row["name"],
            height=row["height"],
            weight=row["weight"],
            allergies=row.get("allergies"),
        )
        db.add(member)
    db.commit()

    return {"status": "uploaded"}


@router.get("/", response_model=list[CrewMemberRead])
def read_crew(db: Session = Depends(get_db)):
    return db.query(CrewMember).all()
