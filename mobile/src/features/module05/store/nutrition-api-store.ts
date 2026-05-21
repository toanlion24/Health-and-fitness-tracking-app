import { create } from "zustand";
import { fetchApi } from "../../../core/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type FoodItem = {
  id: number;
  name: string;
  kcalPerServing: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  servingUnit: string | null;
};

export type MealLogItem = {
  id: number;
  foodId: number | null;
  customFoodName: string | null;
  quantity: number;
  unit: string | null;
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
};

export type MealLog = {
  id: number;
  mealType: MealType;
  loggedAt: string;
  notes: string | null;
  items: MealLogItem[];
};

// ─── Store ────────────────────────────────────────────────────────────────────

type NutritionState = {
  // Bữa ăn hôm nay (từ API)
  mealLogs: MealLog[];
  loadingLogs: boolean;
  // Food search
  foods: FoodItem[];
  loadingFoods: boolean;
  // Calo mục tiêu (lấy từ goals của user)
  goalKcal: number;
  // Nước uống (local, không có API riêng)
  waterL: number;
  waterGoalL: number;

  fetchTodayLogs: () => Promise<void>;
  fetchFoods: (query: string) => Promise<void>;
  createMealLog: (mealType: MealType) => Promise<number | null>;
  addFoodToMeal: (mealLogId: number, food: FoodItem, quantity: number) => Promise<void>;
  addCustomFoodToMeal: (mealLogId: number, name: string, kcal: number, protein: number, carb: number, fat: number) => Promise<void>;
  deleteMealLog: (mealLogId: number) => Promise<void>;
  setGoalKcal: (n: number) => void;
  bumpWater: (deltaL: number) => void;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useNutritionApiStore = create<NutritionState>((set, get) => ({
  mealLogs: [],
  loadingLogs: false,
  foods: [],
  loadingFoods: false,
  goalKcal: 2200,
  waterL: 0,
  waterGoalL: 2,

  fetchTodayLogs: async () => {
    set({ loadingLogs: true });
    try {
      const date = todayIso();
      const [logsRes, goalsRes] = await Promise.all([
        fetchApi(`/nutrition/meal-logs?date=${date}`),
        fetchApi("/users/me/goals"),
      ]);
      if (logsRes.ok) {
        const data = (await logsRes.json()) as { items: MealLog[] };
        set({ mealLogs: data.items ?? [] });
      }
      if (goalsRes.ok) {
        const goals = (await goalsRes.json()) as Array<{ dailyKcalTarget?: number | null }>;
        const active = goals.find((g) => g.dailyKcalTarget);
        if (active?.dailyKcalTarget) set({ goalKcal: active.dailyKcalTarget });
      }
    } catch (e) {
      console.error("fetchTodayLogs error:", e);
    } finally {
      set({ loadingLogs: false });
    }
  },

  fetchFoods: async (query: string) => {
    if (query.trim().length < 2) {
      set({ foods: [] });
      return;
    }
    set({ loadingFoods: true });
    try {
      const res = await fetchApi(`/nutrition/foods?q=${encodeURIComponent(query)}&limit=30`);
      if (res.ok) {
        const data = (await res.json()) as FoodItem[];
        set({ foods: data ?? [] });
      }
    } catch (e) {
      console.error("fetchFoods error:", e);
    } finally {
      set({ loadingFoods: false });
    }
  },

  createMealLog: async (mealType: MealType): Promise<number | null> => {
    try {
      const res = await fetchApi("/nutrition/meal-logs", {
        method: "POST",
        body: JSON.stringify({
          mealType,
          loggedAt: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: number };
        await get().fetchTodayLogs();
        return data.id;
      }
    } catch (e) {
      console.error("createMealLog error:", e);
    }
    return null;
  },

  addFoodToMeal: async (mealLogId, food, quantity) => {
    try {
      await fetchApi(`/nutrition/meal-logs/${mealLogId}/items`, {
        method: "POST",
        body: JSON.stringify({ foodId: food.id, quantity }),
      });
      await get().fetchTodayLogs();
    } catch (e) {
      console.error("addFoodToMeal error:", e);
    }
  },

  addCustomFoodToMeal: async (mealLogId, name, kcal, protein, carb, fat) => {
    try {
      await fetchApi(`/nutrition/meal-logs/${mealLogId}/items`, {
        method: "POST",
        body: JSON.stringify({
          customFoodName: name,
          quantity: 1,
          kcal,
          proteinG: protein,
          carbG: carb,
          fatG: fat,
        }),
      });
      await get().fetchTodayLogs();
    } catch (e) {
      console.error("addCustomFoodToMeal error:", e);
    }
  },

  deleteMealLog: async (mealLogId) => {
    try {
      await fetchApi(`/nutrition/meal-logs/${mealLogId}`, { method: "DELETE" });
      await get().fetchTodayLogs();
    } catch (e) {
      console.error("deleteMealLog error:", e);
    }
  },

  setGoalKcal: (goalKcal) => set({ goalKcal }),
  bumpWater: (deltaL) => {
    const { waterL, waterGoalL } = get();
    const next = Math.min(waterGoalL + 0.5, Math.max(0, waterL + deltaL));
    set({ waterL: Math.round(next * 10) / 10 });
  },
}));

// Derived selectors
export function getTodayTotals(logs: MealLog[]): { kcal: number; protein: number; carb: number; fat: number } {
  let kcal = 0, protein = 0, carb = 0, fat = 0;
  for (const log of logs) {
    for (const item of log.items) {
      kcal += item.kcal;
      protein += item.proteinG;
      carb += item.carbG;
      fat += item.fatG;
    }
  }
  return { kcal, protein: Math.round(protein), carb: Math.round(carb), fat: Math.round(fat) };
}

export function getMealLogsByType(logs: MealLog[], type: MealType): MealLog[] {
  return logs.filter((l) => l.mealType === type);
}

export function getMealKcal(logs: MealLog[], type: MealType): number {
  return getMealLogsByType(logs, type).reduce((sum, l) => sum + l.items.reduce((s, i) => s + i.kcal, 0), 0);
}
