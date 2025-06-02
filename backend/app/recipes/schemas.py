from pydantic import BaseModel
from typing import Optional, List


class ProductCreate(BaseModel):
    name: str
    category: str
    calories_per_100g: float
    allergen: Optional[str] = None


class RecipeIngredientCreate(BaseModel):
    product_id: int
    quantity_in_grams: float


class RecipeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    portions: int

    calories_per_portion: Optional[float] = None
    protein_per_portion: Optional[float] = None
    fat_per_portion: Optional[float] = None
    carbs_per_portion: Optional[float] = None

    ingredients: List[RecipeIngredientCreate]
