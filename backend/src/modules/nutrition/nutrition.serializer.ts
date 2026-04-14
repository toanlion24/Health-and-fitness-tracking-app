import type { Prisma } from "@prisma/client";
import type { FoodDto, MealLogDto, MealLogItemDto } from "@health-fitness/shared";

type FoodRow = Prisma.FoodCatalogGetPayload<object>;
type ItemRow = Prisma.MealLogItemGetPayload<object>;
type MealRow = Prisma.MealLogGetPayload<{ include: { items: true } }>;

export function serializeFood(row: FoodRow): FoodDto {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    kcalPerServing: row.kcalPerServing,
    proteinG: row.proteinG.toString(),
    carbG: row.carbG.toString(),
    fatG: row.fatG.toString(),
    servingUnit: row.servingUnit,
  };
}

export function serializeMealItem(row: ItemRow): MealLogItemDto {
  return {
    id: row.id,
    mealLogId: row.mealLogId,
    foodId: row.foodId,
    customFoodName: row.customFoodName,
    quantity: row.quantity.toString(),
    unit: row.unit,
    kcal: row.kcal,
    proteinG: row.proteinG.toString(),
    carbG: row.carbG.toString(),
    fatG: row.fatG.toString(),
  };
}

export function serializeMeal(row: MealRow): MealLogDto {
  return {
    id: row.id,
    userId: row.userId,
    mealType: row.mealType,
    loggedAt: row.loggedAt.toISOString(),
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    items: row.items.map(serializeMealItem),
  };
}
