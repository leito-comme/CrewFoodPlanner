from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from typing import List
import random

from app.database import get_async_session
from app.menu.schemas import MenuGenerationRequest, DayMenu
from app.crew.models import CrewMember
from app.shipping.models import ShippingData
from app.recipes.models import Recipe, RecipeIngredient

router = APIRouter(tags=["menu"])


def calculate_daily_kbzu_for_crew(crew_members: List[CrewMember]):
    total_calories = 0
    total_protein = 0
    total_fat = 0
    total_carbs = 0

    for member in crew_members:
        weight = member.weight
        height = member.height
        # Примерная формула Харриса-Бенедикта:
        calories = 10 * weight + 6.25 * height - 5 * 30 + 5  # возраст условно 30 лет
        protein = weight * 1.5
        fat = weight * 1
        carbs = (calories - (protein * 4 + fat * 9)) / 4

        total_calories += calories
        total_protein += protein
        total_fat += fat
        total_carbs += carbs

    return {
        "calories": total_calories,
        "protein": total_protein,
        "fat": total_fat,
        "carbs": total_carbs,
    }


async def generate_menus_for_days(db: AsyncSession, days: int):
    shipping_result = await db.execute(select(ShippingData).filter_by(is_current=True))
    shipping = shipping_result.scalar_one_or_none()

    crew_result = await db.execute(select(CrewMember))
    crew = crew_result.scalars().all()

    allergies = {member.allergies for member in crew if member.allergies}

    daily_kbzu = calculate_daily_kbzu_for_crew(crew)

    recipe_result = await db.execute(
        select(Recipe).options(
            selectinload(Recipe.ingredients).selectinload(RecipeIngredient.product)
        )
    )
    all_recipes = recipe_result.scalars().unique().all()

    safe_recipes = []
    for recipe in all_recipes:
        skip = False
        for ingredient in recipe.ingredients:
            if ingredient.product.allergen in allergies:
                skip = True
                break
        if not skip:
            safe_recipes.append(recipe)

    # Генерация меню
    menus = []
    for day in range(days):
        daily_menu = []
        total = {"cal": 0, "prot": 0, "fat": 0, "carb": 0}
        random.shuffle(safe_recipes)

        for recipe in safe_recipes:
            if len(daily_menu) >= 3:  # ограничение до 3 блюд в день
                break

            total["cal"] += (recipe.calories_per_portion or 0) * recipe.portions
            total["prot"] += (recipe.protein_per_portion or 0) * recipe.portions
            total["fat"] += (recipe.fat_per_portion or 0) * recipe.portions
            total["carb"] += (recipe.carbs_per_portion or 0) * recipe.portions

            daily_menu.append({"recipe_id": recipe.id, "name": recipe.name})

            # Можно добавить проверку, если достигли 90-95% КБЖУ, но с 3 блюдами это необязательно

        menus.append({"name": f"Day {day + 1}", "recipes": daily_menu})

    return menus


@router.post("/generate", response_model=List[DayMenu])
async def generate_menu(
    request: MenuGenerationRequest, db: AsyncSession = Depends(get_async_session)
):
    if request.days < 1:
        raise HTTPException(status_code=400, detail="Number of days must be at least 1")

    menus = await generate_menus_for_days(db, request.days)
    return menus
