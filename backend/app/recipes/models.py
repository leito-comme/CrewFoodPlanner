from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum, Integer, String, Float, Text, ForeignKey
from typing import List

from app.database import Base
from app.constants.enum import ProductAllergens, ProductCategories


class Product(Base):

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    category: Mapped[ProductCategories] = mapped_column(
        Enum(ProductCategories), nullable=False
    )
    calories_per_100g: Mapped[float] = mapped_column(Float, nullable=False)
    allergen: Mapped[ProductAllergens] = mapped_column(
        Enum(ProductAllergens), default=ProductAllergens.NONE
    )


class Recipe(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    portions: Mapped[int] = mapped_column(Integer, nullable=False)

    calories_per_portion: Mapped[float] = mapped_column(Float, nullable=True)
    protein_per_portion: Mapped[float] = mapped_column(Float, nullable=True)
    fat_per_portion: Mapped[float] = mapped_column(Float, nullable=True)
    carbs_per_portion: Mapped[float] = mapped_column(Float, nullable=True)

    ingredients: Mapped[List["RecipeIngredient"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan"
    )


class RecipeIngredient(Base):
    id: Mapped[int] = mapped_column(primary_key=True)

    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.id", ondelete="CASCADE")
    )

    quantity_in_grams: Mapped[float] = mapped_column(Float, nullable=False)

    recipe: Mapped["Recipe"] = relationship(back_populates="ingredients")
    product: Mapped["Product"] = relationship()
