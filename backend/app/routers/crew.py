from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.models.crew import CrewMember
from app.schemas.crew import CrewMemberCreate, CrewMemberRead
from app.database import get_db
import pandas as pd
from io import BytesIO
import logging

router = APIRouter(prefix="/crew", tags=["crew"])

logger = logging.getLogger(__name__)


@router.post("/add", response_model=CrewMemberRead)
def create_crew(member: CrewMemberCreate, db: Session = Depends(get_db)):
    db_member = CrewMember(**member.model_dump())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member


@router.post("/upload", response_model=list[CrewMemberRead])
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        if not file.filename.endswith((".xls", ".xlsx")):
            raise HTTPException(status_code=400, detail="Invalid file type!")

        db.query(CrewMember).delete()
        db.commit()

        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))

        required_columns = {"name", "height", "weight", "allergies"}
        if not required_columns.issubset(df.columns):
            raise HTTPException(
                status_code=400, detail=f"Probably missed columns: {required_columns}"
            )

        crew_members = []
        for _, row in df.iterrows():
            member = CrewMember(
                name=row["name"],
                height="{:.1f}".format(row["height"]),
                weight="{:.1f}".format(row["weight"]),
                allergies=row.get("allergies"),
            )
            db.add(member)
            crew_members.append(member)

        db.commit()
        return crew_members

    except Exception as e:
        logger.error(f"Error during file upload: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("", response_model=list[CrewMemberRead])
def read_crew(db: Session = Depends(get_db)):
    return db.query(CrewMember).all()
