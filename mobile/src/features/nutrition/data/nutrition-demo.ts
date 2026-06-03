export type MealSlot = "breakfast" | "lunch" | "dinner";

export type FoodDef = {
  id: string;
  name: string;
  kcal: number;
  serving: string;
  protein: string;
  carbs: string;
  fat: string;
  blurb: string;
  filter: "all" | "protein" | "lowcal";
};

export const FOOD_CATALOG: FoodDef[] = [
  {
    id: "rice",
    name: "Cooked rice (1 cup)",
    kcal: 200,
    serving: "1 cup",
    protein: "4.00g",
    carbs: "45.00g",
    fat: "0.50g",
    blurb: "A classic source of clean, easily digestible complex carbohydrates.",
    filter: "all",
  },
  {
    id: "chicken",
    name: "Chicken breast (100g)",
    kcal: 165,
    serving: "100g",
    protein: "31.00g",
    carbs: "0.00g",
    fat: "3.60g",
    blurb: "Lean protein source ideal for muscle recovery and satiety.",
    filter: "protein",
  },
  {
    id: "egg",
    name: "Whole egg (1 large)",
    kcal: 78,
    serving: "1 egg",
    protein: "6.30g",
    carbs: "0.60g",
    fat: "5.30g",
    blurb: "Highly bioavailable complete protein and healthy fats.",
    filter: "all",
  },
  {
    id: "banana",
    name: "Banana (medium)",
    kcal: 105,
    serving: "1 fruit",
    protein: "1.30g",
    carbs: "27.00g",
    fat: "0.40g",
    blurb: "Quick-digesting energy and high potassium for recovery.",
    filter: "all",
  },
];

export function getFoodById(id: string): FoodDef | undefined {
  return FOOD_CATALOG.find((f) => f.id === id);
}

export type LoggedLine = { id: string; name: string; kcal: number; sub?: string };

export function sumKcal(lines: LoggedLine[]): number {
  return lines.reduce((a, b) => a + b.kcal, 0);
}

