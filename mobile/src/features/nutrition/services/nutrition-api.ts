import type { FoodDto, MealLogDto } from "@health-fitness/shared";
import { apiFetch } from "../../../core/api/client";

export async function fetchFoods(q?: string): Promise<FoodDto[]> {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<FoodDto[]>(`/api/v1/foods${suffix}`, { auth: true });
}

export async function fetchMealLogsForDate(date: string): Promise<MealLogDto[]> {
  return apiFetch<MealLogDto[]>(
    `/api/v1/meal-logs?date=${encodeURIComponent(date)}`,
    { auth: true },
  );
}

export async function createMealLog(body: {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  loggedAt: string;
  notes?: string | null;
}): Promise<MealLogDto> {
  return apiFetch<MealLogDto>("/api/v1/meal-logs", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}

export async function addMealItem(
  mealLogId: number,
  body: {
    foodId?: number;
    customFoodName?: string;
    quantity: number;
    unit?: string;
    kcal?: number;
    proteinG?: number;
    carbG?: number;
    fatG?: number;
  },
): Promise<MealLogDto> {
  return apiFetch<MealLogDto>(`/api/v1/meal-logs/${mealLogId}/items`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  });
}
