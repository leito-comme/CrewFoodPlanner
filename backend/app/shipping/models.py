from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime, SqlEnum, Boolean

from app.database import Base
from app.constants.enum import Seasons


class ShippingData(Base):

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    voyage_number: Mapped[str] = mapped_column(nullable=False)
    departure_time: Mapped[DateTime] = mapped_column(nullable=False)
    arrival_time: Mapped[DateTime] = mapped_column(nullable=False)
    season: Mapped[Seasons] = mapped_column(SqlEnum(Seasons), nullable=False)
    is_current: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false", index=True
    )
