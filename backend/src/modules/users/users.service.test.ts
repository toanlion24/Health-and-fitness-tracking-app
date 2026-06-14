import { describe, expect, it, vi, beforeEach } from "vitest";
import { getMe, updateProfile, putGoals, registerDeviceToken } from "./users.service.js";
import { AppError } from "../../shared/errors/app-error.js";

vi.mock("../../shared/db/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    userProfile: {
      upsert: vi.fn(),
    },
    userGoal: {
      updateMany: vi.fn(),
      create: vi.fn(),
    },
    deviceToken: {
      upsert: vi.fn(),
    },
  },
}));

const mockPrisma = await import("../../shared/db/prisma.js").then(
  (m) => m.prisma
);

describe("Users Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMe", () => {
    it("should return user with profile and goals", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        status: "active",
        profile: {
          fullName: "Test User",
          gender: "male",
          dob: new Date("1990-01-01"),
          heightCm: 175 as any,
          activityLevel: "moderate",
          timezone: "Asia/Ho_Chi_Minh",
          locale: "vi",
        },
        goals: [
          {
            id: 1,
            goalType: "weight_loss",
            targetWeightKg: 70 as any,
            weeklyWorkoutTarget: 4,
            dailyKcalTarget: 2000,
            startDate: new Date(),
            targetDate: new Date(),
            isActive: true,
          },
        ],
      };

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await getMe(1);

      expect(result.id).toBe(1);
      expect(result.email).toBe("test@example.com");
      expect(result.profile?.fullName).toBe("Test User");
      expect(result.goals).toHaveLength(1);
    });

    it("should throw 404 when user not found", async () => {
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(null);

      await expect(getMe(999)).rejects.toThrow(AppError);
    });
  });

  describe("updateProfile", () => {
    it("should update profile successfully", async () => {
      vi.mocked(mockPrisma.userProfile.upsert).mockResolvedValue({} as any);
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 1,
        email: "test@example.com",
        status: "active",
        profile: {
          fullName: "Updated Name",
          gender: "female",
          dob: new Date(),
          heightCm: 165 as any,
          activityLevel: "active",
          timezone: "UTC",
          locale: "en",
        },
        goals: [],
      } as any);

      const result = await updateProfile(1, {
        fullName: "Updated Name",
        gender: "female",
        heightCm: 165,
      });

      expect(result.profile?.fullName).toBe("Updated Name");
      expect(mockPrisma.userProfile.upsert).toHaveBeenCalled();
    });

    it("should return getMe when no data provided", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        status: "active",
        profile: null,
        goals: [],
      };

      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await updateProfile(1, {});

      expect(result.id).toBe(1);
      expect(mockPrisma.userProfile.upsert).not.toHaveBeenCalled();
    });
  });

  describe("putGoals", () => {
    it("should create new goal and deactivate old ones", async () => {
      vi.mocked(mockPrisma.$transaction).mockImplementation(async (fn) => {
        const tx = {
          userGoal: {
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
            create: vi.fn().mockResolvedValue({ id: 2 }),
          },
        };
        return fn(tx);
      });
      vi.mocked(mockPrisma.user.findUnique).mockResolvedValue({
        id: 1,
        email: "test@example.com",
        status: "active",
        profile: null,
        goals: [
          {
            id: 2,
            goalType: "muscle_gain",
            targetWeightKg: 80 as any,
            weeklyWorkoutTarget: 5,
            dailyKcalTarget: 2500,
            startDate: new Date(),
            targetDate: new Date(),
            isActive: true,
          },
        ],
      } as any);

      const result = await putGoals(1, {
        goalType: "muscle_gain",
        targetWeightKg: 80,
        weeklyWorkoutTarget: 5,
        dailyKcalTarget: 2500,
      });

      expect(result.goals).toHaveLength(1);
      expect(result.goals[0].goalType).toBe("muscle_gain");
    });
  });

  describe("registerDeviceToken", () => {
    it("should register device token successfully", async () => {
      vi.mocked(mockPrisma.deviceToken.upsert).mockResolvedValue({} as any);

      const result = await registerDeviceToken(1, {
        expoPushToken: "ExponentPushToken[xxx]",
        platform: "android",
      });

      expect(result).toEqual({ ok: true });
      expect(mockPrisma.deviceToken.upsert).toHaveBeenCalledWith({
        where: { expoPushToken: "ExponentPushToken[xxx]" },
        create: {
          userId: 1,
          expoPushToken: "ExponentPushToken[xxx]",
          platform: "android",
          isActive: true,
        },
        update: {
          userId: 1,
          platform: "android",
          isActive: true,
        },
      });
    });
  });
});
