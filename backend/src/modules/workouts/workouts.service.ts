import { Decimal } from "@prisma/client/runtime/library";
import { ApiErrorCodes } from "@health-fitness/shared";
import type {
  ExerciseDto,
  WorkoutPlanDetailDto,
  WorkoutPlanSummaryDto,
  WorkoutSessionDetailDto,
  WorkoutSessionSummaryDto,
} from "@health-fitness/shared";
import { prisma } from "../../shared/db/prisma.js";
import { AppError } from "../../shared/errors/app-error.js";
import {
  serializeExercise,
  serializePlanDetail,
  serializePlanSummary,
  serializeSessionDetail,
  serializeSessionSummary,
} from "./workouts.serializer.js";
import type {
  AddWorkoutSetBody,
  CompleteWorkoutSessionBody,
  CreateWorkoutPlanBody,
  CreateWorkoutSessionBody,
  ListExercisesQuery,
  ListWorkoutSessionsQuery,
  PatchWorkoutPlanBody,
  PatchWorkoutSetBody,
} from "./workouts.dto.js";

export async function listExercises(
  query: ListExercisesQuery,
): Promise<ExerciseDto[]> {
  const take = query.limit ?? 100;
  const skip = query.offset ?? 0;
  const rows = await prisma.exerciseCatalog.findMany({
    where: query.muscleGroup
      ? { muscleGroup: { contains: query.muscleGroup } }
      : undefined,
    orderBy: { id: "asc" },
    take,
    skip,
  });
  return rows.map(serializeExercise);
}

export async function createWorkoutPlan(
  userId: number,
  body: CreateWorkoutPlanBody,
): Promise<WorkoutPlanDetailDto> {
  const exerciseIds = body.exercises?.map((e) => e.exerciseId) ?? [];
  if (exerciseIds.length > 0) {
    const count = await prisma.exerciseCatalog.count({
      where: { id: { in: exerciseIds } },
    });
    if (count !== exerciseIds.length) {
      throw new AppError(
        400,
        ApiErrorCodes.VALIDATION_ERROR,
        "One or more exercise ids are invalid",
      );
    }
  }

  const plan = await prisma.$transaction(async (tx) => {
    const p = await tx.workoutPlan.create({
      data: {
        userId,
        name: body.name,
        description: body.description ?? null,
      },
    });
    if (body.exercises?.length) {
      await tx.workoutPlanExercise.createMany({
        data: body.exercises.map((e, idx) => ({
          planId: p.id,
          exerciseId: e.exerciseId,
          sortOrder: e.sortOrder ?? idx,
          targetSets: e.targetSets ?? null,
          targetReps: e.targetReps ?? null,
          targetWeightKg:
            e.targetWeightKg === undefined || e.targetWeightKg === null
              ? null
              : new Decimal(e.targetWeightKg.toString()),
          restSec: e.restSec ?? null,
        })),
      });
    }
    return p.id;
  });

  const full = await prisma.workoutPlan.findFirst({
    where: { id: plan, userId },
    include: { exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } } },
  });
  if (!full) {
    throw new AppError(500, ApiErrorCodes.INTERNAL_ERROR, "Plan create failed");
  }
  return serializePlanDetail(full);
}

export async function listWorkoutPlans(
  userId: number,
  includeExercises: boolean,
): Promise<Array<WorkoutPlanSummaryDto | WorkoutPlanDetailDto>> {
  if (includeExercises) {
    const rows = await prisma.workoutPlan.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } },
      },
    });
    return rows.map(serializePlanDetail);
  }
  const rows = await prisma.workoutPlan.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(serializePlanSummary);
}

export async function getWorkoutPlan(
  userId: number,
  planId: number,
): Promise<WorkoutPlanDetailDto> {
  const row = await prisma.workoutPlan.findFirst({
    where: { id: planId, userId },
    include: {
      exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!row) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Workout plan not found");
  }
  return serializePlanDetail(row);
}

export async function patchWorkoutPlan(
  userId: number,
  planId: number,
  body: PatchWorkoutPlanBody,
): Promise<WorkoutPlanDetailDto> {
  const existing = await prisma.workoutPlan.findFirst({
    where: { id: planId, userId },
  });
  if (!existing) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Workout plan not found");
  }

  if (body.exercises?.length) {
    const exerciseIds = body.exercises.map((e) => e.exerciseId);
    const count = await prisma.exerciseCatalog.count({
      where: { id: { in: exerciseIds } },
    });
    if (count !== exerciseIds.length) {
      throw new AppError(
        400,
        ApiErrorCodes.VALIDATION_ERROR,
        "One or more exercise ids are invalid",
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.workoutPlan.update({
      where: { id: planId },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined
          ? { description: body.description }
          : {}),
      },
    });
    if (body.exercises) {
      await tx.workoutPlanExercise.deleteMany({ where: { planId } });
      if (body.exercises.length > 0) {
        await tx.workoutPlanExercise.createMany({
          data: body.exercises.map((e, idx) => ({
            planId,
            exerciseId: e.exerciseId,
            sortOrder: e.sortOrder ?? idx,
            targetSets: e.targetSets ?? null,
            targetReps: e.targetReps ?? null,
            targetWeightKg:
              e.targetWeightKg === undefined || e.targetWeightKg === null
                ? null
                : new Decimal(e.targetWeightKg.toString()),
            restSec: e.restSec ?? null,
          })),
        });
      }
    }
  });

  return getWorkoutPlan(userId, planId);
}

export async function deleteWorkoutPlan(
  userId: number,
  planId: number,
): Promise<void> {
  const res = await prisma.workoutPlan.deleteMany({
    where: { id: planId, userId },
  });
  if (res.count === 0) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Workout plan not found");
  }
}

function sessionDateToUtcDate(sessionDate: string): Date {
  return new Date(`${sessionDate}T00:00:00.000Z`);
}

export async function createWorkoutSession(
  userId: number,
  body: CreateWorkoutSessionBody,
): Promise<WorkoutSessionDetailDto> {
  if (body.planId != null) {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: body.planId, userId },
    });
    if (!plan) {
      throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Workout plan not found");
    }
  }

  const startedAt = body.startedAt
    ? new Date(body.startedAt)
    : new Date();

  const session = await prisma.workoutSession.create({
    data: {
      userId,
      planId: body.planId ?? null,
      sessionDate: sessionDateToUtcDate(body.sessionDate),
      startedAt,
      notes: body.notes ?? null,
    },
    include: {
      sets: { include: { exercise: true }, orderBy: { setIndex: "asc" } },
      plan: true,
    },
  });

  return serializeSessionDetail(session);
}

export async function listWorkoutSessions(
  userId: number,
  query: ListWorkoutSessionsQuery,
): Promise<WorkoutSessionSummaryDto[]> {
  const limit = query.limit ?? 30;
  const where: { userId: number; sessionDate?: { gte: Date; lte: Date } } = {
    userId,
  };
  if (query.from && query.to) {
    where.sessionDate = {
      gte: sessionDateToUtcDate(query.from),
      lte: sessionDateToUtcDate(query.to),
    };
  } else if (query.from) {
    const d = sessionDateToUtcDate(query.from);
    where.sessionDate = { gte: d, lte: d };
  } else if (query.to) {
    const d = sessionDateToUtcDate(query.to);
    where.sessionDate = { gte: d, lte: d };
  }
  const rows = await prisma.workoutSession.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: limit,
  });
  return rows.map(serializeSessionSummary);
}

export async function getWorkoutSession(
  userId: number,
  sessionId: number,
): Promise<WorkoutSessionDetailDto> {
  const row = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      sets: { include: { exercise: true }, orderBy: { setIndex: "asc" } },
      plan: true,
    },
  });
  if (!row) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Workout session not found");
  }
  return serializeSessionDetail(row);
}

export async function addWorkoutSet(
  userId: number,
  sessionId: number,
  body: AddWorkoutSetBody,
): Promise<WorkoutSessionDetailDto> {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Workout session not found");
  }
  if (session.status !== "in_progress") {
    throw new AppError(
      409,
      ApiErrorCodes.CONFLICT,
      "Cannot add sets to a completed session",
    );
  }

  const ex = await prisma.exerciseCatalog.findUnique({
    where: { id: body.exerciseId },
  });
  if (!ex) {
    throw new AppError(
      400,
      ApiErrorCodes.VALIDATION_ERROR,
      "Invalid exercise id",
    );
  }

  await prisma.workoutSessionSet.create({
    data: {
      sessionId,
      exerciseId: body.exerciseId,
      setIndex: body.setIndex,
      actualReps: body.actualReps ?? null,
      actualWeightKg:
        body.actualWeightKg === undefined || body.actualWeightKg === null
          ? null
          : new Decimal(body.actualWeightKg.toString()),
      actualDurationSec: body.actualDurationSec ?? null,
      rpe: body.rpe ?? null,
    },
  });

  return getWorkoutSession(userId, sessionId);
}

export async function patchWorkoutSet(
  userId: number,
  sessionId: number,
  setId: number,
  body: PatchWorkoutSetBody,
): Promise<WorkoutSessionDetailDto> {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Workout session not found");
  }
  if (session.status !== "in_progress") {
    throw new AppError(
      409,
      ApiErrorCodes.CONFLICT,
      "Cannot modify sets on a completed session",
    );
  }

  const setRow = await prisma.workoutSessionSet.findFirst({
    where: { id: setId, sessionId },
  });
  if (!setRow) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Set not found");
  }

  const data: {
    actualReps?: number | null;
    actualWeightKg?: Decimal | null;
    actualDurationSec?: number | null;
    rpe?: number | null;
  } = {};
  if (body.actualReps !== undefined) {
    data.actualReps = body.actualReps;
  }
  if (body.actualWeightKg !== undefined) {
    data.actualWeightKg =
      body.actualWeightKg === null
        ? null
        : new Decimal(body.actualWeightKg.toString());
  }
  if (body.actualDurationSec !== undefined) {
    data.actualDurationSec = body.actualDurationSec;
  }
  if (body.rpe !== undefined) {
    data.rpe = body.rpe;
  }

  if (Object.keys(data).length > 0) {
    await prisma.workoutSessionSet.update({
      where: { id: setId },
      data,
    });
  }

  return getWorkoutSession(userId, sessionId);
}

export async function completeWorkoutSession(
  userId: number,
  sessionId: number,
  body: CompleteWorkoutSessionBody,
): Promise<WorkoutSessionDetailDto> {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
  });
  if (!session) {
    throw new AppError(404, ApiErrorCodes.NOT_FOUND, "Workout session not found");
  }
  if (session.status === "completed") {
    throw new AppError(
      409,
      ApiErrorCodes.CONFLICT,
      "Session already completed",
    );
  }

  const endedAt = body.endedAt ? new Date(body.endedAt) : new Date();

  await prisma.workoutSession.update({
    where: { id: sessionId },
    data: {
      status: "completed",
      endedAt,
    },
  });

  return getWorkoutSession(userId, sessionId);
}
