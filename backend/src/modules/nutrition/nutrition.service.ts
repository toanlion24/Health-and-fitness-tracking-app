import { Decimal } from "@prisma/client/runtime/library";
import { ApiErrorCodes } from "@health-fitness/shared";
import type { FoodDto, MealLogDto } from "@health-fitness/shared";
import { prisma } from "../../shared/db/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import { serializeFood, serializeMeal } from "./nutrition.serializer.js";
import type {
  AddMealLogItemBody,
  CreateMealLogBody,
  ListFoodsQuery,
  ListMealLogsQuery,
  PatchMealLogBody,
  PatchMealLogItemBody,
} from "./nutrition.dto.js";

function dayRangeUtc(date: string): { start: Date; end: Date } {
  const start = new Date(`${date}T00:00:00.000Z`);
  const end = new Date(`${date}T23:59:59.999Z`);
  return { start, end };
}

export async function listFoods(
  userId: number,
  query: ListFoodsQuery,
): Promise<FoodDto[]> {
  const take = query.limit ?? 50;
  const where: {
    OR: Array<{ userId: null } | { userId: number }>;
    name?: { contains: string };
  } = {
    OR: [{ userId: null }, { userId }],
  };
  if (query.q && query.q.trim().length > 0) {
    where.name = { contains: query.q.trim() };
  }
  const rows = await prisma.foodCatalog.findMany({
    where,
    orderBy: { name: "asc" },
    take,
  });
  return rows.map(serializeFood);
}

export async function createMealLog(
  userId: number,
  body: CreateMealLogBody,
): Promise<MealLogDto> {
  const row = await prisma.mealLog.create({
    data: {
      userId,
      mealType: body.mealType,
      loggedAt: new Date(body.loggedAt),
      notes: body.notes ?? null,
    },
    include: { items: true },
  });
  return serializeMeal(row);
}

export async function listMealLogsForDate(
  userId: number,
  query: ListMealLogsQuery,
): Promise<MealLogDto[]> {
  const { start, end } = dayRangeUtc(query.date);
  const rows = await prisma.mealLog.findMany({
    where: {
      userId,
      loggedAt: { gte: start, lte: end },
    },
    orderBy: { loggedAt: "asc" },
    include: { items: true },
  });
  return rows.map(serializeMeal);
}

export async function getMealLog(
  userId: number,
  mealLogId: number,
): Promise<MealLogDto> {
  const row = await prisma.mealLog.findFirst({
    where: { id: mealLogId, userId },
    include: { items: true },
  });
  if (!row) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Meal log not found");
  }
  return serializeMeal(row);
}

export async function patchMealLog(
  userId: number,
  mealLogId: number,
  body: PatchMealLogBody,
): Promise<MealLogDto> {
  const existing = await prisma.mealLog.findFirst({
    where: { id: mealLogId, userId },
  });
  if (!existing) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Meal log not found");
  }
  const data: {
    mealType?: typeof body.mealType;
    loggedAt?: Date;
    notes?: string | null;
  } = {};
  if (body.mealType !== undefined) {
    data.mealType = body.mealType;
  }
  if (body.loggedAt !== undefined) {
    data.loggedAt = new Date(body.loggedAt);
  }
  if (body.notes !== undefined) {
    data.notes = body.notes;
  }
  if (Object.keys(data).length === 0) {
    return getMealLog(userId, mealLogId);
  }
  const row = await prisma.mealLog.update({
    where: { id: mealLogId },
    data,
    include: { items: true },
  });
  return serializeMeal(row);
}

export async function deleteMealLog(
  userId: number,
  mealLogId: number,
): Promise<void> {
  const res = await prisma.mealLog.deleteMany({
    where: { id: mealLogId, userId },
  });
  if (res.count === 0) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Meal log not found");
  }
}

function scaleMacros(
  kcalPer: number,
  protein: Decimal,
  carb: Decimal,
  fat: Decimal,
  quantity: number,
): { kcal: number; proteinG: Decimal; carbG: Decimal; fatG: Decimal } {
  const q = new Decimal(quantity.toString());
  return {
    kcal: Math.round(kcalPer * quantity),
    proteinG: protein.mul(q),
    carbG: carb.mul(q),
    fatG: fat.mul(q),
  };
}

export async function addMealLogItem(
  userId: number,
  mealLogId: number,
  body: AddMealLogItemBody,
): Promise<MealLogDto> {
  const meal = await prisma.mealLog.findFirst({
    where: { id: mealLogId, userId },
  });
  if (!meal) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Meal log not found");
  }

  let foodId: number | null = null;
  let customFoodName: string | null = null;
  let kcal: number;
  let proteinG: Decimal;
  let carbG: Decimal;
  let fatG: Decimal;

  if (body.foodId != null) {
    const food = await prisma.foodCatalog.findFirst({
      where: {
        id: body.foodId,
        OR: [{ userId: null }, { userId }],
      },
    });
    if (!food) {
      throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Food not found");
    }
    foodId = food.id;
    const scaled = scaleMacros(
      food.kcalPerServing,
      food.proteinG,
      food.carbG,
      food.fatG,
      body.quantity,
    );
    kcal = scaled.kcal;
    proteinG = scaled.proteinG;
    carbG = scaled.carbG;
    fatG = scaled.fatG;
  } else {
    customFoodName = body.customFoodName ?? null;
    kcal = body.kcal ?? 0;
    proteinG = new Decimal((body.proteinG ?? 0).toString());
    carbG = new Decimal((body.carbG ?? 0).toString());
    fatG = new Decimal((body.fatG ?? 0).toString());
  }

  await prisma.mealLogItem.create({
    data: {
      mealLogId,
      foodId,
      customFoodName,
      quantity: new Decimal(body.quantity.toString()),
      unit: body.unit ?? null,
      kcal,
      proteinG,
      carbG,
      fatG,
    },
  });

  return getMealLog(userId, mealLogId);
}

export async function patchMealLogItem(
  userId: number,
  mealLogId: number,
  itemId: number,
  body: PatchMealLogItemBody,
): Promise<MealLogDto> {
  const meal = await prisma.mealLog.findFirst({
    where: { id: mealLogId, userId },
  });
  if (!meal) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Meal log not found");
  }

  const item = await prisma.mealLogItem.findFirst({
    where: { id: itemId, mealLogId },
    include: { food: true },
  });
  if (!item) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Meal item not found");
  }

  let kcal = item.kcal;
  let proteinG = item.proteinG;
  let carbG = item.carbG;
  let fatG = item.fatG;
  const quantity =
    body.quantity !== undefined
      ? new Decimal(body.quantity.toString())
      : item.quantity;

  if (item.foodId != null && item.food && body.quantity !== undefined) {
    const scaled = scaleMacros(
      item.food.kcalPerServing,
      item.food.proteinG,
      item.food.carbG,
      item.food.fatG,
      body.quantity,
    );
    kcal = scaled.kcal;
    proteinG = scaled.proteinG;
    carbG = scaled.carbG;
    fatG = scaled.fatG;
  } else if (body.quantity !== undefined && item.foodId == null) {
    const ratio = quantity.div(item.quantity);
    kcal = Math.round(item.kcal * Number(ratio.toString()));
    proteinG = item.proteinG.mul(ratio);
    carbG = item.carbG.mul(ratio);
    fatG = item.fatG.mul(ratio);
  }

  if (body.kcal !== undefined) {
    kcal = body.kcal;
  }
  if (body.proteinG !== undefined) {
    proteinG = new Decimal(body.proteinG.toString());
  }
  if (body.carbG !== undefined) {
    carbG = new Decimal(body.carbG.toString());
  }
  if (body.fatG !== undefined) {
    fatG = new Decimal(body.fatG.toString());
  }

  await prisma.mealLogItem.update({
    where: { id: itemId },
    data: {
      quantity,
      unit: body.unit !== undefined ? body.unit : item.unit,
      kcal,
      proteinG,
      carbG,
      fatG,
    },
  });

  return getMealLog(userId, mealLogId);
}

export async function deleteMealLogItem(
  userId: number,
  mealLogId: number,
  itemId: number,
): Promise<void> {
  const meal = await prisma.mealLog.findFirst({
    where: { id: mealLogId, userId },
  });
  if (!meal) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Meal log not found");
  }
  const res = await prisma.mealLogItem.deleteMany({
    where: { id: itemId, mealLogId },
  });
  if (res.count === 0) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Meal item not found");
  }
}
