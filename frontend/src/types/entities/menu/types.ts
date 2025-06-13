export interface RecipeIngredientResponse {
  product_id: number;
  product_name: string;
  quantity_in_grams: number;
}

export interface RecipeInfo {
  recipe_id: number;
  name: string;
  description: string;
  portions: number;
  calories_per_portion: number;
  protein_per_portion: number;
  fat_per_portion: number;
  carbs_per_portion: number;
  ingredients: RecipeIngredientResponse[];
}

export interface MenuVariant {
  recipes: RecipeInfo[];
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
}

export interface DayMenu {
  name: string;
  date: string;
  variants: MenuVariant[];
}

export interface CurrentMenuProduct {
  id: number;
  product_id: number;
  product_name: string;
  total_quantity_grams: number;
  price_per_kilo: number;
}
