from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, Enum, Boolean, text
from datetime import datetime

from app.database import Base
from app.constants.enum import Seasons


class ShippingData(Base):

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    voyage_number: Mapped[str] = mapped_column(nullable=False)
    departure_date: Mapped[datetime] = mapped_column(nullable=False)
    arrival_date: Mapped[datetime] = mapped_column(nullable=False)
    season: Mapped[Seasons] = mapped_column(Enum(Seasons), nullable=False)
    description: Mapped[str] = mapped_column(nullable=True)
    is_current: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=text("false"), index=True
    )
