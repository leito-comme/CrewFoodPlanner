from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, delete, update
from typing import List, Dict, Tuple, Optional
import random
import math
from datetime import datetime, timedelta
from collections import defaultdict
from app.menu.storage import save_menu, load_menu

from app.database import get_async_session
from app.menu.schemas import (
    DayMenu,
    RecipeInfo,
    RecipeIngredientResponse,
    ScaledRecipe,
    ProductOutput,
    ProductPriceUpdate,
    VariantSelect,
    CurrentMenuProductRead,
)
from app.crew.models import CrewMember
from app.shipping.models import ShippingData
from app.recipes.models import Recipe, RecipeIngredient, Product
from app.menu.models import CurrentMenuProduct
from app.constants.enum import MealTypes


router = APIRouter(tags=["menu"])

recipe_history = defaultdict(list)


@router.post("/menu/select")
async def select_menu_variant(
    data: VariantSelect,
    db: AsyncSession = Depends(get_async_session),
):
    variant_index = data.variant_index
    menu = load_menu()

    crew_size = await db.scalar(select(func.count()).select_from(CrewMember))

    if not menu:
        raise HTTPException(status_code=404, detail="No menu available")

    product_map = defaultdict(
        lambda: {"product_name": "", "quantity": 0.0, "price_per_kilo": 0.0}
    )

    for day in menu:
        try:
            variant = day["variants"][variant_index]
        except IndexError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid variant index {variant_index} for day {day['date']}",
            )

        for recipe in variant["recipes"]:
            for ingredient in recipe["ingredients"]:
                pid = ingredient["product_id"]
                pname = ingredient["product_name"]
                qty = ingredient["quantity_in_grams"] * crew_size
                product_map[pid]["product_name"] = pname
                product_map[pid]["quantity"] += qty

    product_ids = list(product_map.keys())

    result = await db.execute(
        select(Product.id, Product.price_per_kilo).where(Product.id.in_(product_ids))
    )
    prices = {row.id: row.price_per_kilo for row in result.fetchall()}

    await db.execute(delete(CurrentMenuProduct))

    for pid, data in product_map.items():
        price = prices.get(pid, 0.0)

        db.add(
            CurrentMenuProduct(
                product_id=pid,
                product_name=data["product_name"],
                total_quantity_grams=data["quantity"],
                price_per_kilo=price,
            )
        )

    await db.commit()
    return


@router.get("/menu")
async def get_current_menu(
    variant: Optional[int] = Query(None, ge=0),
    db: AsyncSession = Depends(get_async_session),
):
    full_menu_data = load_menu()

    if not full_menu_data:
        raise HTTPException(status_code=404, detail="Menu not found")

    result = []

    for idx, day in enumerate(full_menu_data):
        day_name = day.get("name", f"Day {idx+1}")
        day_date = day.get("date")
        day_variants = day.get("variants", [])

        if variant is not None:
            if variant < len(day_variants):
                selected_variant = day_variants[variant]
            else:
                selected_variant = {}
        else:
            selected_variant = {}

        result.append(
            {
                "name": day_name,
                "date": day_date,
                "recipes": selected_variant.get("recipes", []),
                "total_calories": selected_variant.get("total_calories", 0),
                "total_protein": selected_variant.get("total_protein", 0),
                "total_fat": selected_variant.get("total_fat", 0),
                "total_carbs": selected_variant.get("total_carbs", 0),
            }
        )

    return result


@router.get("/current-menu-products", response_model=List[CurrentMenuProductRead])
async def get_all_current_menu_products(
    db: AsyncSession = Depends(get_async_session),
):
    result = await db.execute(select(CurrentMenuProduct))
    products = result.scalars().all()
    return products


@router.patch("/current-menu-products")
async def bulk_update_prices(
    updates: List[ProductPriceUpdate],
    db: AsyncSession = Depends(get_async_session),
):
    for item in updates:
        await db.execute(
            update(CurrentMenuProduct)
            .where(CurrentMenuProduct.product_id == item.product_id)
            .values(price_per_kilo=item.price_per_kilo)
        )
    await db.commit()
    return {"status": "prices updated"}


def calculate_daily_kbzu_for_crew(crew_members: List[CrewMember]) -> Dict[str, float]:

    total_calories = 0.0
    total_protein = 0.0
    total_fat = 0.0
    total_carbs = 0.0

    for member in crew_members:
        weight = member.weight
        height = member.height
        # Формула Харриса-Бенедикта для мужчин (можно добавить пол в модель)
        bmr = 10 * weight + 6.25 * height - 5 * 30 + 5  # возраст условно 30 лет
        # Коэффициент активности для моряков (умеренная активность)
        calories = bmr * 1.5

        protein = weight * 1.6
        fat = calories * 0.25 / 9
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


def get_recipe_info(recipe: Recipe, scale: float = 1.0) -> RecipeInfo:

    ingredients = []

    # print(f"Processing recipe: {recipe.name}")
    # print(f"Recipe has {len(recipe.ingredients)} ingredients")

    for ri in recipe.ingredients:
        # print(f"Ingredient: {ri.product.name}, quantity: {ri.quantity_in_grams}")
        ingredients.append(
            RecipeIngredientResponse(
                product_id=ri.product_id,
                product_name=ri.product.name,
                quantity_in_grams=ri.quantity_in_grams * scale,
            )
        )

    return RecipeInfo(
        recipe_id=recipe.id,
        name=recipe.name,
        description=recipe.description,
        portions=max(1, math.ceil(recipe.portions * scale)),
        calories_per_portion=recipe.calories_per_portion,
        protein_per_portion=recipe.protein_per_portion,
        fat_per_portion=recipe.fat_per_portion,
        carbs_per_portion=recipe.carbs_per_portion,
        ingredients=ingredients,
    )


def calculate_recipe_totals(recipes: List[Recipe], crew_size: int) -> Dict[str, float]:
    """Расчет общих значений КБЖУ для списка рецептов"""
    totals = {"calories": 0.0, "protein": 0.0, "fat": 0.0, "carbs": 0.0}

    for recipe in recipes:
        totals["calories"] += recipe.calories_per_portion * recipe.portions
        totals["protein"] += recipe.protein_per_portion * recipe.portions
        totals["fat"] += recipe.fat_per_portion * recipe.portions
        totals["carbs"] += recipe.carbs_per_portion * recipe.portions

    for key in totals:
        totals[key] *= crew_size

    return totals


def calculate_nutrition_score(
    actual: Dict[str, float], target: Dict[str, float]
) -> float:

    score = 0.0
    weights = {"calories": 0.4, "protein": 0.3, "fat": 0.15, "carbs": 0.15}

    for nutrient in target:
        if target[nutrient] > 0:
            ratio = actual[nutrient] / target[nutrient]

            if ratio < 0.8 or ratio > 1.2:
                penalty = abs(1 - ratio) * 2
            else:
                penalty = abs(1 - ratio) * 0.5
            score += penalty * weights[nutrient]

    return score


async def find_best_menu_combination(
    recipes: List[Recipe],
    target_kbzu: Dict[str, float],
    crew_size: int,
    max_attempts: int = 2000,
) -> Tuple[List[ScaledRecipe], float, Dict[str, float]]:
    """Поиск лучшей комбинации рецептов для дневного меню"""
    best_combination = []
    best_score = float("inf")
    best_actual_kbzu = None

    recipes_by_type = defaultdict(list)
    for recipe in recipes:
        recipes_by_type[recipe.meal_type].append(recipe)

    for attempt in range(max_attempts):
        selected = []

        for meal_type in MealTypes:
            if meal_type in recipes_by_type and recipes_by_type[meal_type]:
                recipe = random.choice(recipes_by_type[meal_type])
                selected.append(recipe)

        if len(selected) < 2:
            continue

        actual_kbzu = calculate_recipe_totals(selected, crew_size)

        scale_factor = (
            target_kbzu["calories"] / actual_kbzu["calories"]
            if actual_kbzu["calories"] > 0
            else 1.0
        )

        scale_factor = max(0.5, min(2.0, scale_factor))

        adjusted_recipes = []
        for recipe in selected:
            scaled_recipe = ScaledRecipe(recipe, scale_factor)
            adjusted_recipes.append(scaled_recipe)

        adjusted_kbzu = calculate_recipe_totals(adjusted_recipes, crew_size)

        score = calculate_nutrition_score(adjusted_kbzu, target_kbzu)

        if score < best_score:
            best_score = score
            best_combination = adjusted_recipes
            best_actual_kbzu = adjusted_kbzu

            if score < 0.15:
                break

    return best_combination, best_score, best_actual_kbzu


def get_available_recipes(
    all_recipes: List[Recipe],
    history: Dict[int, List[datetime]],
    current_date: datetime,
    meal_type: Optional[str] = None,
    min_gap_days: int = 3,
) -> List[Recipe]:

    available = []
    for recipe in all_recipes:
        if meal_type and recipe.meal_type != meal_type:
            continue

        last_used = history.get(recipe.id, [])

        can_use = all(
            current_date - date >= timedelta(days=min_gap_days) for date in last_used
        )

        if can_use:
            available.append(recipe)

    return available


async def generate_menus_for_days(
    db: AsyncSession,
    days: int,
    history: Dict[int, List[datetime]],
    start_date: datetime,
) -> List[DayMenu]:

    crew_result = await db.execute(select(CrewMember))
    crew = crew_result.scalars().all()
    crew_size = len(crew)

    if crew_size == 0:
        raise HTTPException(status_code=400, detail="No crew members found")

    allergies = set()
    for member in crew:
        if member.allergies:
            allergies.add(member.allergies)

    recipe_result = await db.execute(
        select(Recipe)
        .options(selectinload(Recipe.ingredients).joinedload(RecipeIngredient.product))
        .execution_options(populate_existing=True)
    )

    all_recipes = recipe_result.scalars().unique().all()

    # print(f"Loaded {len(all_recipes)} recipes")
    # if all_recipes:
    #     print(f"First recipe has {len(all_recipes[0].ingredients)} ingredients")

    safe_recipes = []
    for recipe in all_recipes:
        is_safe = True
        for ingredient in recipe.ingredients:
            if ingredient.product.allergen and ingredient.product.allergen in allergies:
                print(ingredient.product.allergen)
                is_safe = False
                break
        if is_safe:
            safe_recipes.append(recipe)

    if not safe_recipes:
        raise HTTPException(
            status_code=400, detail="No safe recipes found for crew allergies"
        )

    daily_kbzu = calculate_daily_kbzu_for_crew(crew)

    menus = []
    current_date = start_date

    for day in range(days):
        variants = []

        for variant_num in range(3):

            available_recipes = get_available_recipes(
                safe_recipes, history, current_date
            )

            if len(available_recipes) < len(MealTypes) * 2:
                available_recipes = safe_recipes.copy()

            selected_recipes, score, actual_kbzu = await find_best_menu_combination(
                available_recipes, daily_kbzu, crew_size
            )

            if not selected_recipes:
                continue

            recipe_infos = []
            for scaled_recipe in selected_recipes:

                recipe_info = get_recipe_info(
                    scaled_recipe.original_recipe, scaled_recipe.scale_factor
                )

                recipe_info.portions = scaled_recipe.portions
                recipe_infos.append(recipe_info)

            total_calories = sum(
                r.calories_per_portion * r.portions for r in recipe_infos
            )
            total_protein = sum(
                r.protein_per_portion * r.portions for r in recipe_infos
            )
            total_fat = sum(r.fat_per_portion * r.portions for r in recipe_infos)
            total_carbs = sum(r.carbs_per_portion * r.portions for r in recipe_infos)

            variant = {
                "recipes": recipe_infos,
                "total_calories": total_calories,
                "total_protein": total_protein,
                "total_fat": total_fat,
                "total_carbs": total_carbs,
            }
            variants.append(variant)

            for scaled_recipe in selected_recipes:
                history[scaled_recipe.id].append(current_date)

        if not variants:

            basic_recipes = []
            for meal_type in MealTypes:
                type_recipes = [r for r in safe_recipes if r.meal_type == meal_type]
                if type_recipes:
                    basic_recipes.append(random.choice(type_recipes))

            recipe_infos = [get_recipe_info(r, 1.0) for r in basic_recipes]

            variant = {
                "recipes": recipe_infos,
                "total_calories": sum(
                    r.calories_per_portion * r.portions for r in recipe_infos
                ),
                "total_protein": sum(
                    r.protein_per_portion * r.portions for r in recipe_infos
                ),
                "total_fat": sum(r.fat_per_portion * r.portions for r in recipe_infos),
                "total_carbs": sum(
                    r.carbs_per_portion * r.portions for r in recipe_infos
                ),
            }
            variants = [
                variant,
                variant,
                variant,
            ]

        day_menu = DayMenu(
            name=f"Day {day + 1}",
            date=current_date.strftime("%Y-%m-%d"),
            variants=variants[:3],
        )
        menus.append(day_menu)

        current_date += timedelta(days=1)

    return menus


@router.get("/generate", response_model=List[DayMenu])
async def generate_menu(db: AsyncSession = Depends(get_async_session)):
    try:
        result = await db.execute(
            select(ShippingData).where(ShippingData.is_current == True).limit(1)
        )
        shipping_data = result.scalar_one_or_none()

        if not shipping_data:
            raise HTTPException(
                status_code=404, detail="No current shipping data found"
            )

        start_date = datetime.combine(shipping_data.departure_date, datetime.min.time())
        end_date = shipping_data.arrival_date
        days = (end_date - shipping_data.departure_date).days + 1

        menus = await generate_menus_for_days(db, days, recipe_history, start_date)

        menu_dicts = [menu.model_dump() for menu in menus]
        save_menu(menu_dicts)
        return menus
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating menu: {str(e)}")
