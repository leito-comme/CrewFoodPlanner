from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, SqlEnum
from app.database import Base
from app.constants.enum import Seasons

class ShippingData(Base):
	__tablename__ = "shipping_data"

	id: Mapped[int] = mapped_column(primary_key=True, index=True)
	voyage_number: Mapped[str] = mapped_column(nullable=False)
	departure_time: Mapped[DateTime] = mapped_column(nullable=False)
	arrival_time: Mapped[DateTime] = mapped_column(nullable=False)
	season: Mapped[Seasons] = mapped_column(SqlEnum(Seasons), nullable=False)