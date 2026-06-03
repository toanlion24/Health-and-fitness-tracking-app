import { create } from "zustand";
import type { LoggedLine, MealSlot } from "../data/nutrition-demo";
import { sumKcal } from "../data/nutrition-demo";

type NutritionLogState = {
  goalKcal: number;
  waterL: number;
  waterGoalL: number;
  breakfast: LoggedLine[];
  lunch: LoggedLine[];
  dinner: LoggedLine[];
  setGoalKcal: (n: number) => void;
  setWaterL: (n: number) => void;
  bumpWater: (deltaL: number) => void;
  addToMeal: (meal: MealSlot, line: LoggedLine) => void;
  resetDay: () => void;
};

const defaultBreakfast: LoggedLine[] = [
  { id: "b1", name: "Greek yogurt", kcal: 180, sub: "200g · Protein rich" },
  { id: "b2", name: "Banana", kcal: 105, sub: "1 medium · Potassium" },
  { id: "b3", name: "Oatmeal", kcal: 135, sub: "40g dry oats + milk" },
];

const defaultLunch: LoggedLine[] = [
  { id: "l1", name: "Chicken bowl", kcal: 420, sub: "Grilled · veggies" },
  { id: "l2", name: "Avocado salad", kcal: 160, sub: "Mixed greens" },
];

const initial: Pick<NutritionLogState, "goalKcal" | "waterL" | "waterGoalL" | "breakfast" | "lunch" | "dinner"> = {
  goalKcal: 2200,
  waterL: 1.5,
  waterGoalL: 2,
  breakfast: defaultBreakfast,
  lunch: defaultLunch,
  dinner: [],
};

export const useNutritionLogStore = create<NutritionLogState>((set, get) => ({
  ...initial,
  setGoalKcal: (goalKcal) => set({ goalKcal }),
  setWaterL: (waterL) => set({ waterL }),
  bumpWater: (deltaL) => {
    const { waterL, waterGoalL } = get();
    const next = Math.min(waterGoalL + 0.5, Math.max(0, waterL + deltaL));
    set({ waterL: Math.round(next * 10) / 10 });
  },
  addToMeal: (meal, line) => {
    const key = meal === "breakfast" ? "breakfast" : meal === "lunch" ? "lunch" : "dinner";
    const next = [...get()[key], line];
    set({ [key]: next } as Partial<NutritionLogState>);
  },
  resetDay: () =>
    set({
      breakfast: defaultBreakfast,
      lunch: defaultLunch,
      dinner: [],
      waterL: 1.5,
    }),
}));

export function consumedToday(state: Pick<NutritionLogState, "breakfast" | "lunch" | "dinner">): number {
  return sumKcal(state.breakfast) + sumKcal(state.lunch) + sumKcal(state.dinner);
}

export function mealTotal(state: Pick<NutritionLogState, "breakfast" | "lunch" | "dinner">, meal: MealSlot): number {
  switch (meal) {
    case "breakfast":
      return sumKcal(state.breakfast);
    case "lunch":
      return sumKcal(state.lunch);
    case "dinner":
      return sumKcal(state.dinner);
    default:
      return 0;
  }
}

export function mealLines(state: Pick<NutritionLogState, "breakfast" | "lunch" | "dinner">, meal: MealSlot): LoggedLine[] {
  switch (meal) {
    case "breakfast":
      return state.breakfast;
    case "lunch":
      return state.lunch;
    case "dinner":
      return state.dinner;
    default:
      return [];
  }
}
