from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import math
from typing import List
from app.recipes.models import Recipe


class MenuGenerationRequest(BaseModel):
    days: int


class RecipeIngredientResponse(BaseModel):
    product_id: int
    product_name: str
    quantity_in_grams: float


class RecipeInfo(BaseModel):
    recipe_id: int
    name: str
    description: str
    portions: int
    calories_per_portion: float
    protein_per_portion: float
    fat_per_portion: float
    carbs_per_portion: float
    ingredients: List[RecipeIngredientResponse]


class ScaledRecipe:
    """Класс для хранения информации о рецепте с масштабированием порций"""

    def __init__(self, recipe: Recipe, scale_factor: float = 1.0):
        self.original_recipe = recipe
        self.scale_factor = scale_factor

        self.id = recipe.id
        self.name = recipe.name
        self.description = recipe.description
        self.meal_type = recipe.meal_type
        self.portions = max(1, math.ceil(recipe.portions * scale_factor))
        self.calories_per_portion = recipe.calories_per_portion
        self.protein_per_portion = recipe.protein_per_portion
        self.fat_per_portion = recipe.fat_per_portion
        self.carbs_per_portion = recipe.carbs_per_portion

        self.ingredients = recipe.ingredients

    def __repr__(self):
        return f"ScaledRecipe(id={self.id}, name='{self.name}', scale={self.scale_factor}, portions={self.portions})"


class MenuVariant(BaseModel):
    recipes: List[RecipeInfo]
    total_calories: float
    total_protein: float
    total_fat: float
    total_carbs: float


class DayMenu(BaseModel):
    name: str
    date: str  # Формат YYYY-MM-DD
    variants: List[MenuVariant]  # Три варианта меню
