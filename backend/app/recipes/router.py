from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Union

from app.database import get_async_session
from app.recipes.models import Product, Recipe, RecipeIngredient
from app.recipes.schemas import ProductCreate, RecipeCreate, ProductPriceUpdate

router = APIRouter(tags=["recipes"])


@router.get("/products")
async def read_products(
    session: AsyncSession = Depends(get_async_session),
) -> List[ProductCreate]:
    result = await session.execute(select(Product))
    return result.scalars().all()


@router.post("/products")
async def add_products(
    products: Union[ProductCreate, List[ProductCreate]],
    session: AsyncSession = Depends(get_async_session),
):
    if not isinstance(products, list):
        products = [products]

    added_ids = []

    for product in products:
        result = await session.execute(
            select(Product).where(Product.name == product.name)
        )
        if result.scalar_one_or_none():
            continue

        new_product = Product(
            name=product.name,
            category=product.category,
            calories_per_100g=product.calories_per_100g,
            allergen=product.allergen or "none",
            price_per_kilo=product.price_per_kilo,
        )
        session.add(new_product)
        await session.flush()
        added_ids.append(new_product.id)

    await session.commit()
    return {"status": "products added", "product_ids": added_ids}


@router.post("/products/prices")
async def update_product_prices(
    updates: List[ProductPriceUpdate],
    session: AsyncSession = Depends(get_async_session),
):
    updated_ids = []

    for item in updates:
        result = await session.execute(select(Product).where(Product.id == item.id))
        product = result.scalar_one_or_none()

        if not product:
            continue  # Пропустить несуществующий продукт

        product.price_per_kilo = item.price_per_kilo
        session.add(product)
        updated_ids.append(product.id)

    await session.commit()
    return {"status": "prices updated", "updated_product_ids": updated_ids}


@router.get("/recipes")
async def get_recipes(
    session: AsyncSession = Depends(get_async_session),
) -> List[RecipeCreate]:
    result = await session.execute(select(Recipe))
    return result.scalars().all()


@router.post("/recipes")
async def add_recipes(
    recipes: Union[RecipeCreate, List[RecipeCreate]],
    session: AsyncSession = Depends(get_async_session),
):
    if not isinstance(recipes, list):
        recipes = [recipes]

    added_ids = []

    for recipe_data in recipes:
        new_recipe = Recipe(
            name=recipe_data.name,
            description=recipe_data.description,
            meal_type=recipe_data.meal_type,
            portions=recipe_data.portions,
            calories_per_portion=recipe_data.calories_per_portion,
            protein_per_portion=recipe_data.protein_per_portion,
            fat_per_portion=recipe_data.fat_per_portion,
            carbs_per_portion=recipe_data.carbs_per_portion,
        )
        session.add(new_recipe)
        await session.flush()

        for ing in recipe_data.ingredients:
            session.add(
                RecipeIngredient(
                    recipe_id=new_recipe.id,
                    product_id=ing.product_id,
                    quantity_in_grams=ing.quantity_in_grams,
                )
            )

        added_ids.append(new_recipe.id)

    await session.commit()
    return {"status": "recipes added", "recipe_ids": added_ids}
