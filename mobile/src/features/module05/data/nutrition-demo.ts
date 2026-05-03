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
    id: "chicken",
    name: "Chicken breast",
    kcal: 165,
    serving: "100g",
    protein: "31g",
    carbs: "0g",
    fat: "3.6g",
    blurb: "Lean protein source ideal for muscle recovery and satiety.",
    filter: "protein",
  },
  {
    id: "banana",
    name: "Banana",
    kcal: 105,
    serving: "1 medium",
    protein: "1.3g",
    carbs: "27g",
    fat: "0.4g",
    blurb: "Quick energy and potassium for training days.",
    filter: "all",
  },
  {
    id: "oats",
    name: "Oatmeal",
    kcal: 150,
    serving: "40g dry",
    protein: "5g",
    carbs: "27g",
    fat: "3g",
    blurb: "Sustained-release carbs for breakfast or pre-workout.",
    filter: "all",
  },
  {
    id: "avocado",
    name: "Avocado salad",
    kcal: 160,
    serving: "1 cup",
    protein: "3g",
    carbs: "9g",
    fat: "15g",
    blurb: "Healthy fats to pair with any meal.",
    filter: "lowcal",
  },
];

export function getFoodById(id: string): FoodDef | undefined {
  return FOOD_CATALOG.find((f) => f.id === id);
}

export type LoggedLine = { id: string; name: string; kcal: number; sub?: string };

export function sumKcal(lines: LoggedLine[]): number {
  return lines.reduce((a, b) => a + b.kcal, 0);
}
