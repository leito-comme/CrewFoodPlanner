from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, Float
from app.database import Base


class CurrentMenuProduct(Base):

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(Integer, nullable=False)
    product_name: Mapped[str] = mapped_column(String, nullable=False)
    total_quantity_grams: Mapped[float] = mapped_column(Float, nullable=False)
    price_per_kilo: Mapped[float] = mapped_column(Float, nullable=False)
