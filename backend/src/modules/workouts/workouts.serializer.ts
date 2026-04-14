import type { Prisma } from "@prisma/client";
import type {
  ExerciseDto,
  WorkoutPlanDetailDto,
  WorkoutPlanExerciseDto,
  WorkoutPlanSummaryDto,
  WorkoutSessionDetailDto,
  WorkoutSessionSetDto,
  WorkoutSessionSummaryDto,
} from "@health-fitness/shared";

type ExerciseRow = Prisma.ExerciseCatalogGetPayload<object>;
type PlanRow = Prisma.WorkoutPlanGetPayload<{
  include: { exercises: { include: { exercise: true } } };
}>;
type PlanSummaryRow = Prisma.WorkoutPlanGetPayload<object>;
type SessionDetail = Prisma.WorkoutSessionGetPayload<{
  include: {
    sets: { include: { exercise: true } };
    plan: true;
  };
}>;
type SessionSummary = Prisma.WorkoutSessionGetPayload<object>;
type SetRow = Prisma.WorkoutSessionSetGetPayload<{
  include: { exercise: true };
}>;

export function serializeExercise(row: ExerciseRow): ExerciseDto {
  return {
    id: row.id,
    name: row.name,
    muscleGroup: row.muscleGroup,
    equipment: row.equipment,
    met: row.met ? row.met.toString() : null,
  };
}

export function serializePlanExercise(
  row: Prisma.WorkoutPlanExerciseGetPayload<{
    include: { exercise: true };
  }>,
): WorkoutPlanExerciseDto {
  return {
    id: row.id,
    planId: row.planId,
    exercise: serializeExercise(row.exercise),
    sortOrder: row.sortOrder,
    targetSets: row.targetSets,
    targetReps: row.targetReps,
    targetWeightKg: row.targetWeightKg ? row.targetWeightKg.toString() : null,
    restSec: row.restSec,
  };
}

export function serializePlanSummary(row: PlanSummaryRow): WorkoutPlanSummaryDto {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function serializePlanDetail(row: PlanRow): WorkoutPlanDetailDto {
  return {
    ...serializePlanSummary(row),
    exercises: row.exercises.map(serializePlanExercise),
  };
}

export function serializeSet(row: SetRow): WorkoutSessionSetDto {
  return {
    id: row.id,
    sessionId: row.sessionId,
    exercise: serializeExercise(row.exercise),
    setIndex: row.setIndex,
    actualReps: row.actualReps,
    actualWeightKg: row.actualWeightKg ? row.actualWeightKg.toString() : null,
    actualDurationSec: row.actualDurationSec,
    rpe: row.rpe,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeSessionSummary(
  row: SessionSummary,
): WorkoutSessionSummaryDto {
  return {
    id: row.id,
    userId: row.userId,
    planId: row.planId,
    sessionDate: row.sessionDate.toISOString().slice(0, 10),
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt ? row.endedAt.toISOString() : null,
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
  };
}

export function serializeSessionDetail(
  row: SessionDetail,
): WorkoutSessionDetailDto {
  return {
    ...serializeSessionSummary(row),
    sets: row.sets.map(serializeSet),
  };
}
