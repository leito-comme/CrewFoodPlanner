from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.shipping.models import ShippingData
from app.shipping.schemas import ShippingDataCreate, ShippingDataRead
from app.database import get_async_session
from app.database import User
from app.users.dependecies import current_user
from typing import List

router = APIRouter(prefix="/shipping", tags=["shipping"])


@router.get("")
async def read_shipping_data(
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_user),
) -> List[ShippingDataRead]:
    result = await db.execute(select(ShippingData).order_by(ShippingData.id.desc()))
    return result.scalars().all()


@router.post("/add")
async def create_shipping_data(
    voyage: ShippingDataCreate,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_user),
) -> ShippingDataCreate:
    if user.role not in ("admin", "manager"):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    await db.execute(update(ShippingData).values(is_current=False))

    db_voyage = ShippingData(**voyage.model_dump(), is_current=True)
    db.add(db_voyage)
    await db.commit()
    await db.refresh(db_voyage)
    return db_voyage
