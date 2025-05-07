from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession
from app.crew.models import CrewMember
from app.crew.schemas import CrewMemberCreate, CrewMemberRead
from app.database import get_async_session
import pandas as pd
from typing import List
from io import BytesIO

router = APIRouter(prefix="/crew", tags=["crew"])


@router.get("")
async def read_crew(
    db: AsyncSession = Depends(get_async_session),
) -> List[CrewMemberRead]:
    result = await db.execute(select(CrewMember))
    return result.scalars().all()


@router.post("/add")
async def create_crew(
    member: CrewMemberCreate, db: AsyncSession = Depends(get_async_session)
) -> CrewMemberCreate:
    db_member = CrewMember(**member.model_dump())
    db.add(db_member)
    await db.commit()
    await db.refresh(db_member)
    return db_member


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...), db: AsyncSession = Depends(get_async_session)
) -> List[CrewMemberCreate]:
    try:
        if not file.filename.endswith((".xls", ".xlsx")):
            raise HTTPException(status_code=400, detail="Invalid file type!")

        db.execute(select(CrewMember).delete())
        await db.commit()

        contents = await file.read()
        df = pd.read_excel(BytesIO(contents))

        required_columns = {"name", "height", "weight", "allergies"}
        if not required_columns.issubset(df.columns):
            missing_columns = required_columns - set(df.columns)
            raise HTTPException(
                status_code=400, detail=f"Missing columns: {','.join(missing_columns)}"
            )

        crew_members = []
        for _, row in df.iterrows():
            member = CrewMember(
                name=row["name"],
                height="{:.1f}".format(row["height"]),
                weight="{:.1f}".format(row["weight"]),
                allergies=row.get("allergies"),
            )
            crew_members.append(member)

        db.execute(
            insert(CrewMember).values([member.dict() for member in crew_members])
        )
        await db.commit()
        return crew_members

    except Exception as e:
        await db.rollback()
        if isinstance(e, HTTPException):
            raise HTTPException(status_code=e.status_code, detail=e.detail)
        else:
            raise HTTPException(status_code=500, detail="Internal server error")
