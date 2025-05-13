from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.shipping.models import ShippingData
from app.shipping.schemas import ShippingDataCreate, ShippingDataRead
from app.database import get_async_session
from typing import List

router = APIRouter(prefix="/shipping", tags=["shipping"])


@router.get("")
async def read_shiping_data(
    db: AsyncSession = Depends(get_async_session),
) -> List[ShippingDataRead]:
    result = await db.execute(
        select(ShippingData).order_by(ShippingData.id.desc())
    )
    return result.scalars().all()


@router.post("/add")
async def create_shipping_data(
    voyage: ShippingDataCreate, db: AsyncSession = Depends(get_async_session)
) -> ShippingDataCreate:
    await db.execute(update(ShippingData).values(is_current=False))

    db_voyage = ShippingData(**voyage.model_dump(), is_current=True)
    db.add(db_voyage)
    await db.commit()
    await db.refresh(db_voyage)
    return db_voyage
