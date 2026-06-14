import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  listExercises,
  createWorkoutPlan,
  getWorkoutPlan,
  deleteWorkoutPlan,
  addWorkoutSet,
  completeWorkoutSession,
} from "./workouts.service.js";
import { AppError } from "../../shared/errors/app-error.js";

vi.mock("../../shared/db/prisma.js", () => ({
  prisma: {
    exerciseCatalog: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    workoutPlan: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
    workoutSession: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    workoutSessionSet: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const mockPrisma = await import("../../shared/db/prisma.js").then(
  (m) => m.prisma
);

describe("Workouts Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listExercises", () => {
    it("should return list of exercises with default pagination", async () => {
      const mockExercises = [
        { id: 1, name: "Bench Press", muscleGroup: "chest", description: null },
        { id: 2, name: "Squat", muscleGroup: "legs", description: null },
      ];

      vi.mocked(mockPrisma.exerciseCatalog.findMany).mockResolvedValue(
        mockExercises as any
      );

      const result = await listExercises({});

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Bench Press");
      expect(mockPrisma.exerciseCatalog.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { id: "asc" },
        take: 100,
        skip: 0,
      });
    });

    it("should filter by muscle group", async () => {
      vi.mocked(mockPrisma.exerciseCatalog.findMany).mockResolvedValue([]);

      await listExercises({ muscleGroup: "chest" });

      expect(mockPrisma.exerciseCatalog.findMany).toHaveBeenCalledWith({
        where: { muscleGroup: { contains: "chest" } },
        orderBy: { id: "asc" },
        take: 100,
        skip: 0,
      });
    });
  });

  describe("createWorkoutPlan", () => {
    it("should create workout plan without exercises", async () => {
      vi.mocked(mockPrisma.workoutPlan.create).mockResolvedValue({ id: 1 } as any);
      vi.mocked(mockPrisma.$transaction).mockImplementation(async (fn) => {
        const tx = { workoutPlan: { create: vi.fn().mockResolvedValue({ id: 1 }) } };
        return fn(tx);
      });
      vi.mocked(mockPrisma.workoutPlan.findFirst).mockResolvedValue({
        id: 1,
        name: "My Plan",
        userId: 1,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: [],
      } as any);

      const result = await createWorkoutPlan(1, { name: "My Plan" });

      expect(result.name).toBe("My Plan");
    });

    it("should validate exercise IDs when provided", async () => {
      vi.mocked(mockPrisma.exerciseCatalog.count).mockResolvedValue(1);

      await expect(
        createWorkoutPlan(1, {
          name: "Plan",
          exercises: [
            { exerciseId: 1 },
            { exerciseId: 2 },
            { exerciseId: 3 },
          ],
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("getWorkoutPlan", () => {
    it("should return workout plan with exercises", async () => {
      const mockPlan = {
        id: 1,
        name: "Push Day",
        userId: 1,
        description: "Chest and triceps",
        exercises: [
          {
            id: 1,
            exerciseId: 1,
            exercise: { id: 1, name: "Bench Press", muscleGroup: "chest" },
          },
        ],
      };

      vi.mocked(mockPrisma.workoutPlan.findFirst).mockResolvedValue(mockPlan as any);

      const result = await getWorkoutPlan(1, 1);

      expect(result.name).toBe("Push Day");
      expect(result.exercises).toHaveLength(1);
    });

    it("should throw 404 when plan not found", async () => {
      vi.mocked(mockPrisma.workoutPlan.findFirst).mockResolvedValue(null);

      await expect(getWorkoutPlan(1, 999)).rejects.toThrow(AppError);
    });
  });

  describe("deleteWorkoutPlan", () => {
    it("should delete plan successfully", async () => {
      vi.mocked(mockPrisma.workoutPlan.deleteMany).mockResolvedValue({ count: 1 });

      await expect(deleteWorkoutPlan(1, 1)).resolves.toBeUndefined();
    });

    it("should throw 404 when plan not found", async () => {
      vi.mocked(mockPrisma.workoutPlan.deleteMany).mockResolvedValue({ count: 0 });

      await expect(deleteWorkoutPlan(1, 999)).rejects.toThrow(AppError);
    });
  });

  describe("addWorkoutSet", () => {
    it("should add set to in-progress session", async () => {
      vi.mocked(mockPrisma.workoutSession.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        status: "in_progress",
      } as any);
      vi.mocked(mockPrisma.exerciseCatalog.findUnique).mockResolvedValue({
        id: 1,
        name: "Bench Press",
      } as any);
      vi.mocked(mockPrisma.workoutSessionSet.create).mockResolvedValue({} as any);
      vi.mocked(mockPrisma.workoutSession.findFirst).mockResolvedValueOnce({
        id: 1,
        userId: 1,
        status: "in_progress",
        sets: [],
        plan: null,
      } as any);

      await expect(
        addWorkoutSet(1, 1, {
          exerciseId: 1,
          setIndex: 1,
          actualReps: 10,
          actualWeightKg: 60,
        })
      ).resolves.not.toThrow();
    });

    it("should throw conflict when session is completed", async () => {
      vi.mocked(mockPrisma.workoutSession.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        status: "completed",
      } as any);

      await expect(
        addWorkoutSet(1, 1, {
          exerciseId: 1,
          setIndex: 1,
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("completeWorkoutSession", () => {
    it("should complete session successfully", async () => {
      vi.mocked(mockPrisma.workoutSession.findFirst)
        .mockResolvedValueOnce({
          id: 1,
          userId: 1,
          status: "in_progress",
        } as any)
        .mockResolvedValueOnce({
          id: 1,
          userId: 1,
          status: "completed",
          sets: [],
          plan: null,
        } as any);
      vi.mocked(mockPrisma.workoutSession.update).mockResolvedValue({} as any);

      const result = await completeWorkoutSession(1, 1, {});

      expect(mockPrisma.workoutSession.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          status: "completed",
          endedAt: expect.any(Date),
        },
      });
    });

    it("should throw conflict when already completed", async () => {
      vi.mocked(mockPrisma.workoutSession.findFirst).mockResolvedValue({
        id: 1,
        userId: 1,
        status: "completed",
      } as any);

      await expect(completeWorkoutSession(1, 1, {})).rejects.toThrow(AppError);
    });
  });
});
