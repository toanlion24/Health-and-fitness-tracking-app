/**
 * Pure helpers for daily goal score (0–100) used by aggregation and tests.
 */
export function computeGoalScore(input: {
  totalKcalIn: number;
  dailyKcalTarget: number | null;
  totalWorkoutMinutes: number;
  weeklyWorkoutTarget: number | null;
}): number | null {
  const { totalKcalIn, dailyKcalTarget, totalWorkoutMinutes, weeklyWorkoutTarget } =
    input;
  const parts: number[] = [];

  if (dailyKcalTarget != null && dailyKcalTarget > 0) {
    const diffRatio = Math.abs(totalKcalIn - dailyKcalTarget) / dailyKcalTarget;
    parts.push(Math.round(Math.max(0, Math.min(100, 100 * (1 - Math.min(1, diffRatio))))));
  }

  if (weeklyWorkoutTarget != null && weeklyWorkoutTarget > 0) {
    const dailySessionMinutes = Math.max(1, (weeklyWorkoutTarget * 45) / 7);
    const ratio = Math.min(1, totalWorkoutMinutes / dailySessionMinutes);
    parts.push(Math.round(ratio * 100));
  }

  if (parts.length === 0) {
    return null;
  }
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}
