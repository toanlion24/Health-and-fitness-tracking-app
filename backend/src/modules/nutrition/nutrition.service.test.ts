import { describe, expect, it, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";
import {
  listFoods,
  createMealLog,
  listMealLogsForDate,
  getMealLog,
  patchMealLog,
  deleteMealLog,
  addMealLogItem,
  patchMealLogItem,
  deleteMealLogItem,
} from "./nutrition.service.js";
import { AppError } from "../../shared/errors/app-error.js";

vi.mock("../../shared/config/env.js", () => ({
  loadEnv: vi.fn(() => ({
    NUTRITION_API_URL: "https://world.openfoodfacts.org/cgi/search.pl",
    ACCESS_TOKEN_TTL_SEC: 900,
    REFRESH_TOKEN_TTL_SEC: 604800,
    BCRYPT_ROUNDS: 10,
  })),
}));

vi.mock("../../shared/db/prisma.js", () => ({
  prisma: {
    foodCatalog: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    mealLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    mealLogItem: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

const mockPrisma = await import("../../shared/db/prisma.js").then(
  (m) => m.prisma
);

describe("Nutrition Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  // ─── listFoods ──────────────────────────────────────────────────────────────

  describe("listFoods", () => {
    it("returns foods from local catalog matching query", async () => {
      const rows = [
        {
          id: 1,
          userId: null,
          name: "Chicken Breast",
          kcalPerServing: 165,
          proteinG: new Decimal("31.0"),
          carbG: new Decimal("0.0"),
          fatG: new Decimal("3.6"),
          servingUnit: "100g",
        },
      ];
      vi.mocked(mockPrisma.foodCatalog.findMany).mockResolvedValue(rows as any);

      const result = await listFoods(1, { q: "chicken" });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Chicken Breast");
      expect(result[0].kcalPerServing).toBe(165);
      expect(mockPrisma.foodCatalog.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ userId: null }, { userId: 1 }],
          name: { contains: "chicken" },
        },
        orderBy: { name: "asc" },
        take: 50,
      });
    });

    it("returns local foods when query is empty", async () => {
      vi.mocked(mockPrisma.foodCatalog.findMany).mockResolvedValue([]);

      await listFoods(1, {});

      expect(mockPrisma.foodCatalog.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ userId: null }, { userId: 1 }],
        },
        orderBy: { name: "asc" },
        take: 50,
      });
    });

    it("uses custom limit from query", async () => {
      vi.mocked(mockPrisma.foodCatalog.findMany).mockResolvedValue([]);

      await listFoods(1, { q: "rice", limit: 10 });

      expect(mockPrisma.foodCatalog.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ userId: null }, { userId: 1 }],
          name: { contains: "rice" },
        },
        orderBy: { name: "asc" },
        take: 10,
      });
    });

    it("serializes Decimal fields to strings in food items", async () => {
      const rows = [
        {
          id: 1,
          userId: null,
          name: "Egg",
          kcalPerServing: 155,
          proteinG: new Decimal("13.0"),
          carbG: new Decimal("1.1"),
          fatG: new Decimal("11.0"),
          servingUnit: "100g",
        },
      ];
      vi.mocked(mockPrisma.foodCatalog.findMany).mockResolvedValue(rows as any);

      const result = await listFoods(1, {});

      expect(typeof result[0].proteinG).toBe("string");
      expect(result[0].proteinG).toBe("13");
    });
  });

  // ─── createMealLog ──────────────────────────────────────────────────────────

  describe("createMealLog", () => {
    it("creates a meal log with correct data", async () => {
      const now = new Date("2026-01-01T08:00:00Z");
      const mockRow = {
        id: 1,
        userId: 5,
        mealType: "breakfast",
        loggedAt: now,
        notes: "Oatmeal",
        createdAt: now,
        items: [],
      };
      vi.mocked(mockPrisma.mealLog.create).mockResolvedValue(mockRow as any);

      const result = await createMealLog(5, {
        mealType: "breakfast",
        loggedAt: "2026-01-01T08:00:00.000Z",
        notes: "Oatmeal",
      });

      expect(result.id).toBe(1);
      expect(result.mealType).toBe("breakfast");
      expect(result.notes).toBe("Oatmeal");
      expect(mockPrisma.mealLog.create).toHaveBeenCalledWith({
        data: {
          userId: 5,
          mealType: "breakfast",
          loggedAt: expect.any(Date),
          notes: "Oatmeal",
        },
        include: { items: true },
      });
    });

    it("creates meal log with null notes when omitted", async () => {
      vi.mocked(mockPrisma.mealLog.create).mockResolvedValue({
        id: 2,
        userId: 5,
        mealType: "lunch",
        loggedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        items: [],
      } as any);

      const result = await createMealLog(5, {
        mealType: "lunch",
        loggedAt: "2026-01-01T12:00:00.000Z",
      });

      expect(result.notes).toBeNull();
    });
  });

  // ─── listMealLogsForDate ─────────────────────────────────────────────────────

  describe("listMealLogsForDate", () => {
    it("returns meal logs for a specific date in ascending order", async () => {
      const mockLogs = [
        {
          id: 1,
          userId: 1,
          mealType: "breakfast",
          loggedAt: new Date("2026-01-01T08:00:00Z"),
          notes: null,
          createdAt: new Date(),
          items: [],
        },
        {
          id: 2,
          userId: 1,
          mealType: "lunch",
          loggedAt: new Date("2026-01-01T12:30:00Z"),
          notes: null,
          createdAt: new Date(),
          items: [],
        },
      ];
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue(mockLogs as any);

      const result = await listMealLogsForDate(1, { date: "2026-01-01" });

      expect(result).toHaveLength(2);
      expect(result[0].mealType).toBe("breakfast");
      expect(result[1].mealType).toBe("lunch");
      expect(mockPrisma.mealLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          loggedAt: {
            gte: new Date("2026-01-01T00:00:00.000Z"),
            lte: new Date("2026-01-01T23:59:59.999Z"),
          },
        },
        orderBy: { loggedAt: "asc" },
        include: { items: true },
      });
    });

    it("returns empty array when no logs exist for date", async () => {
      vi.mocked(mockPrisma.mealLog.findMany).mockResolvedValue([]);

      const result = await listMealLogsForDate(1, { date: "2026-01-01" });

      expect(result).toEqual([]);
    });
  });

  // ─── getMealLog ─────────────────────────────────────────────────────────────

  describe("getMealLog", () => {
    it("returns meal log with items for owned log", async () => {
      const mockLog = {
        id: 10,
        userId: 3,
        mealType: "dinner",
        loggedAt: new Date(),
        notes: "Salad",
        createdAt: new Date(),
        items: [
          {
            id: 1,
            mealLogId: 10,
            foodId: 5,
            customFoodName: null,
            quantity: new Decimal("1.0"),
            unit: "serving",
            kcal: 300,
            proteinG: new Decimal("20.0"),
            carbG: new Decimal("10.0"),
            fatG: new Decimal("15.0"),
          },
        ],
      };
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue(mockLog as any);

      const result = await getMealLog(3, 10);

      expect(result.id).toBe(10);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].kcal).toBe(300);
    });

    it("throws 404 when meal log not found", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue(null);

      await expect(getMealLog(3, 999)).rejects.toThrow(AppError);
    });

    it("throws 404 when meal log belongs to different user", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue(null);

      await expect(getMealLog(3, 10)).rejects.toThrow(AppError);
    });
  });

  // ─── patchMealLog ───────────────────────────────────────────────────────────

  describe("patchMealLog", () => {
    it("updates mealType when provided", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        mealType: "breakfast",
        loggedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        items: [],
      } as any);
      vi.mocked(mockPrisma.mealLog.update).mockResolvedValue({
        id: 1,
        userId: 1,
        mealType: "snack",
        loggedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        items: [],
      } as any);

      const result = await patchMealLog(1, 1, { mealType: "snack" });

      expect(mockPrisma.mealLog.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { mealType: "snack" },
        include: { items: true },
      });
    });

    it("updates notes to null when explicitly set", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        mealType: "breakfast",
        loggedAt: new Date(),
        notes: "Previous note",
        createdAt: new Date(),
        items: [],
      } as any);
      vi.mocked(mockPrisma.mealLog.update).mockResolvedValue({
        id: 1,
        userId: 1,
        mealType: "breakfast",
        loggedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        items: [],
      } as any);

      await patchMealLog(1, 1, { notes: null });

      expect(mockPrisma.mealLog.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { notes: null },
        include: { items: true },
      });
    });

    it("returns existing log without update when no fields provided", async () => {
      const existing = {
        id: 1,
        userId: 1,
        mealType: "breakfast",
        loggedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        items: [],
      };
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue(existing as any);

      await patchMealLog(1, 1, {});

      expect(mockPrisma.mealLog.update).not.toHaveBeenCalled();
    });

    it("throws 404 when log not found", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue(null);

      await expect(patchMealLog(1, 999, { mealType: "snack" })).rejects.toThrow(
        AppError,
      );
    });
  });

  // ─── deleteMealLog ──────────────────────────────────────────────────────────

  describe("deleteMealLog", () => {
    it("deletes meal log and returns void on success", async () => {
      vi.mocked(mockPrisma.mealLog.deleteMany).mockResolvedValue({ count: 1 });

      await expect(deleteMealLog(1, 10)).resolves.toBeUndefined();
      expect(mockPrisma.mealLog.deleteMany).toHaveBeenCalledWith({
        where: { id: 10, userId: 1 },
      });
    });

    it("throws 404 when log not found", async () => {
      vi.mocked(mockPrisma.mealLog.deleteMany).mockResolvedValue({ count: 0 });

      await expect(deleteMealLog(1, 999)).rejects.toThrow(AppError);
    });
  });

  // ─── addMealLogItem ──────────────────────────────────────────────────────────

  describe("addMealLogItem", () => {
    it("adds item from food catalog with scaled macros", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
      } as any);
      vi.mocked(mockPrisma.foodCatalog.findFirst).mockResolvedValue({
        id: 5,
        name: "Chicken Breast",
        kcalPerServing: 165,
        proteinG: new Decimal("31.0"),
        carbG: new Decimal("0.0"),
        fatG: new Decimal("3.6"),
        servingUnit: "100g",
      } as any);
      vi.mocked(mockPrisma.mealLogItem.create).mockResolvedValue({} as any);
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        mealType: "lunch",
        loggedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        items: [],
      } as any);

      await addMealLogItem(1, 1, { foodId: 5, quantity: 2 });

      expect(mockPrisma.mealLogItem.create).toHaveBeenCalledWith({
        data: {
          mealLogId: 1,
          foodId: 5,
          customFoodName: "Chicken Breast",
          quantity: new Decimal("2"),
          unit: "100g",
          kcal: 330,
          proteinG: expect.any(Decimal),
          carbG: expect.any(Decimal),
          fatG: expect.any(Decimal),
        },
      });
    });

    it("adds custom food item with provided macros", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 2,
        userId: 1,
      } as any);
      vi.mocked(mockPrisma.mealLogItem.create).mockResolvedValue({} as any);
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 2,
        userId: 1,
        mealType: "snack",
        loggedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        items: [],
      } as any);

      await addMealLogItem(1, 2, {
        customFoodName: "Protein bar",
        quantity: 1,
        unit: "piece",
        kcal: 200,
        proteinG: 20,
        carbG: 25,
        fatG: 8,
      });

      expect(mockPrisma.mealLogItem.create).toHaveBeenCalledWith({
        data: {
          mealLogId: 2,
          foodId: null,
          customFoodName: "Protein bar",
          quantity: new Decimal("1"),
          unit: "piece",
          kcal: 200,
          proteinG: expect.any(Decimal),
          carbG: expect.any(Decimal),
          fatG: expect.any(Decimal),
        },
      });
    });

    it("throws 404 when meal log not found", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue(null);

      await expect(
        addMealLogItem(1, 999, { foodId: 5, quantity: 1 }),
      ).rejects.toThrow(AppError);
    });

    it("throws 404 when food not found", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
      } as any);
      vi.mocked(mockPrisma.foodCatalog.findFirst).mockResolvedValue(null);

      await expect(
        addMealLogItem(1, 1, { foodId: 999, quantity: 1 }),
      ).rejects.toThrow(AppError);
    });
  });

  // ─── patchMealLogItem ───────────────────────────────────────────────────────

  describe("patchMealLogItem", () => {
    it("recomputes macros when quantity changes on catalog item", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
      } as any);
      vi.mocked(mockPrisma.mealLogItem.findFirst).mockResolvedValue({
        id: 20,
        mealLogId: 1,
        foodId: 5,
        customFoodName: null,
        quantity: new Decimal("1.0"),
        unit: "100g",
        kcal: 165,
        proteinG: new Decimal("31.0"),
        carbG: new Decimal("0.0"),
        fatG: new Decimal("3.6"),
        food: {
          id: 5,
          name: "Chicken Breast",
          kcalPerServing: 165,
          proteinG: new Decimal("31.0"),
          carbG: new Decimal("0.0"),
          fatG: new Decimal("3.6"),
          servingUnit: "100g",
        },
      } as any);
      vi.mocked(mockPrisma.mealLogItem.update).mockResolvedValue({} as any);
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        mealType: "lunch",
        loggedAt: new Date(),
        notes: null,
        createdAt: new Date(),
        items: [],
      } as any);

      await patchMealLogItem(1, 1, 20, { quantity: 3 });

      const updateCall = vi.mocked(mockPrisma.mealLogItem.update).mock.calls[0][0];
      expect(updateCall.data.kcal).toBe(495); // 165 * 3
    });

    it("throws 404 when meal log not found", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue(null);

      await expect(
        patchMealLogItem(1, 999, 1, { quantity: 2 }),
      ).rejects.toThrow(AppError);
    });

    it("throws 404 when item not found", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
      } as any);
      vi.mocked(mockPrisma.mealLogItem.findFirst).mockResolvedValue(null);

      await expect(patchMealLogItem(1, 1, 999, { quantity: 2 })).rejects.toThrow(
        AppError,
      );
    });
  });

  // ─── deleteMealLogItem ──────────────────────────────────────────────────────

  describe("deleteMealLogItem", () => {
    it("deletes item and returns void on success", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
      } as any);
      vi.mocked(mockPrisma.mealLogItem.deleteMany).mockResolvedValue({ count: 1 });

      await expect(deleteMealLogItem(1, 1, 20)).resolves.toBeUndefined();
      expect(mockPrisma.mealLogItem.deleteMany).toHaveBeenCalledWith({
        where: { id: 20, mealLogId: 1 },
      });
    });

    it("throws 404 when meal log not found", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue(null);

      await expect(deleteMealLogItem(1, 999, 1)).rejects.toThrow(AppError);
    });

    it("throws 404 when item not found", async () => {
      vi.mocked(mockPrisma.mealLog.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
      } as any);
      vi.mocked(mockPrisma.mealLogItem.deleteMany).mockResolvedValue({ count: 0 });

      await expect(deleteMealLogItem(1, 1, 999)).rejects.toThrow(AppError);
    });
  });
});
