import { Decimal } from "@prisma/client/runtime/library";
import { ApiErrorCodes } from "@health-fitness/shared";
import type { MeResponseDto } from "@health-fitness/shared";
import { prisma } from "../../shared/db/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import { serializeGoal, serializeProfile } from "./users.serializer.js";
import type {
  PutGoalsBody,
  RegisterDeviceTokenBody,
  UpdateProfileBody,
} from "./users.dto.js";

export async function getMe(userId: number): Promise<MeResponseDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, goals: { where: { isActive: true }, take: 10 } },
  });
  if (!user) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "User not found");
  }
  return {
    id: user.id,
    email: user.email,
    status: user.status,
    profile: user.profile ? serializeProfile(user.profile) : null,
    goals: user.goals.map(serializeGoal),
  };
}

export async function updateProfile(
  userId: number,
  body: UpdateProfileBody,
): Promise<MeResponseDto> {
  const data: {
    fullName?: string | null;
    gender?: string | null;
    dob?: Date | null;
    heightCm?: Decimal | null;
    activityLevel?: string | null;
    timezone?: string | null;
    locale?: string | null;
  } = {};

  if (body.fullName !== undefined) {
    data.fullName = body.fullName === "" ? null : body.fullName;
  }
  if (body.gender !== undefined) {
    data.gender = body.gender;
  }
  if (body.dob !== undefined) {
    data.dob = body.dob ? new Date(`${body.dob}T00:00:00.000Z`) : null;
  }
  if (body.heightCm !== undefined) {
    data.heightCm =
      body.heightCm === null ? null : new Decimal(body.heightCm.toString());
  }
  if (body.activityLevel !== undefined) {
    data.activityLevel = body.activityLevel;
  }
  if (body.timezone !== undefined) {
    data.timezone = body.timezone;
  }
  if (body.locale !== undefined) {
    data.locale = body.locale;
  }

  if (Object.keys(data).length === 0) {
    return getMe(userId);
  }

  await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      fullName: data.fullName ?? null,
      gender: data.gender ?? null,
      dob: data.dob ?? null,
      heightCm: data.heightCm ?? null,
      activityLevel: data.activityLevel ?? null,
      timezone: data.timezone ?? null,
      locale: data.locale ?? null,
    },
    update: data,
  });

  return getMe(userId);
}

export async function putGoals(
  userId: number,
  body: PutGoalsBody,
): Promise<MeResponseDto> {
  const isActive = body.isActive ?? true;

  await prisma.$transaction(async (tx) => {
    await tx.userGoal.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    await tx.userGoal.create({
      data: {
        userId,
        goalType: body.goalType,
        targetWeightKg:
          body.targetWeightKg === undefined || body.targetWeightKg === null
            ? null
            : new Decimal(body.targetWeightKg.toString()),
        weeklyWorkoutTarget: body.weeklyWorkoutTarget ?? null,
        dailyKcalTarget: body.dailyKcalTarget ?? null,
        startDate: body.startDate
          ? new Date(`${body.startDate}T00:00:00.000Z`)
          : null,
        targetDate: body.targetDate
          ? new Date(`${body.targetDate}T00:00:00.000Z`)
          : null,
        isActive,
      },
    });
  });

  return getMe(userId);
}

export async function registerDeviceToken(
  userId: number,
  body: RegisterDeviceTokenBody,
): Promise<{ ok: true }> {
  await prisma.deviceToken.upsert({
    where: { expoPushToken: body.expoPushToken },
    create: {
      userId,
      expoPushToken: body.expoPushToken,
      platform: body.platform,
      isActive: true,
    },
    update: {
      userId,
      platform: body.platform,
      isActive: true,
    },
  });
  return { ok: true };
}
