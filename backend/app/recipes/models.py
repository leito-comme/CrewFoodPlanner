from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Enum, Integer, String, Float, Text, ForeignKey, text
from typing import List

from app.database import Base
from app.constants.enum import ProductAllergens, ProductCategories, MealTypes


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
    price_per_kilo: Mapped[float] = mapped_column(
        Float, nullable=False, server_default=text("0")
    )


class Recipe(Base):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    meal_type: Mapped[MealTypes] = mapped_column(Enum(MealTypes))
    portions: Mapped[int] = mapped_column(Integer, nullable=False)

    calories_per_portion: Mapped[float] = mapped_column(Float, nullable=True)
    protein_per_portion: Mapped[float] = mapped_column(Float, nullable=True)
    fat_per_portion: Mapped[float] = mapped_column(Float, nullable=True)
    carbs_per_portion: Mapped[float] = mapped_column(Float, nullable=True)

    ingredients: Mapped[List["RecipeIngredient"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan", lazy="selectin"
    )


class RecipeIngredient(Base):
    id: Mapped[int] = mapped_column(primary_key=True)

    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipe.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.id", ondelete="CASCADE")
    )

    quantity_in_grams: Mapped[float] = mapped_column(Float, nullable=False)

    recipe: Mapped["Recipe"] = relationship(back_populates="ingredients")
    product: Mapped["Product"] = relationship(lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else "Unknown",
            "quantity_in_grams": self.quantity_in_grams,
            "product_details": (
                {
                    "category": self.product.category.value if self.product else None,
                    "calories": (
                        self.product.calories_per_100g if self.product else None
                    ),
                    "allergen": (
                        self.product.allergen.value
                        if self.product and self.product.allergen
                        else None
                    ),
                }
                if self.product
                else None
            ),
        }
