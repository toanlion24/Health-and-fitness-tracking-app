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
        fetchApi("/me/goals"),
      ]);
      if (logsRes.ok) {
        const data = await logsRes.json();
        const items = Array.isArray(data) ? data : (data?.items ?? []);
        set({ mealLogs: items });
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
    set({ loadingFoods: true });
    try {
      const url = query.trim().length > 0 
        ? `/nutrition/foods?q=${encodeURIComponent(query)}&limit=30` 
        : `/nutrition/foods?limit=50`;
      const res = await fetchApi(url);
      if (res.ok) {
        const raw = (await res.json()) as any[];
        // Backend sends proteinG/carbG/fatG as strings (Prisma Decimal), convert to numbers
        const data: FoodItem[] = (raw ?? []).map((f: any) => ({
          id: f.id,
          name: f.name,
          kcalPerServing: Number(f.kcalPerServing),
          proteinG: Number(f.proteinG),
          carbG: Number(f.carbG),
          fatG: Number(f.fatG),
          servingUnit: f.servingUnit,
        }));
        if (data && data.length > 0) {
          set({ foods: data, loadingFoods: false });
          return;
        }
      }
    } catch (e) {
      console.error("fetchFoods error:", e);
    }

    // Fallback to local data
    try {
      const { FOOD_CATALOG } = await import("../data/nutrition-demo");
      const FOOD_MAP: Record<string, number> = {
        rice: 1,
        chicken: 2,
        egg: 3,
        banana: 4,
      };
      const filtered = query.trim().length > 0
        ? FOOD_CATALOG.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
        : FOOD_CATALOG;

      const mapped = filtered.map((f) => ({
        id: FOOD_MAP[f.id] ?? Math.floor(Math.random() * 1000) + 10,
        name: f.name,
        kcalPerServing: f.kcal,
        proteinG: parseFloat(f.protein) || 0,
        carbG: parseFloat(f.carbs) || 0,
        fatG: parseFloat(f.fat) || 0,
        servingUnit: f.serving,
      }));
      set({ foods: mapped });
    } catch (fallbackError) {
      console.error("Failed to load local foods fallback", fallbackError);
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
    const { waterL } = get();
    const next = Math.max(0, waterL + deltaL);
    set({ waterL: Math.round(next * 10) / 10 });
  },
}));

// Derived selectors
export function getTodayTotals(logs: MealLog[]): { kcal: number; protein: number; carb: number; fat: number } {
  let kcal = 0, protein = 0, carb = 0, fat = 0;
  for (const log of logs) {
    for (const item of log.items) {
      kcal += item.kcal;
      protein += Number(item.proteinG) || 0;
      carb += Number(item.carbG) || 0;
      fat += Number(item.fatG) || 0;
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
