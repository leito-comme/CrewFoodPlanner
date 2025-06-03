from pydantic import BaseModel
from typing import List


class MenuGenerationRequest(BaseModel):
    days: int


class RecipeInfo(BaseModel):
    recipe_id: int
    name: str


class DayMenu(BaseModel):
    name: str
    recipes: List[RecipeInfo]
