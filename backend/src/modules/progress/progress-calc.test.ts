import { describe, expect, it } from "vitest";
import { computeGoalScore } from "./progress-calc.js";

describe("computeGoalScore", () => {
  it("returns null when no targets exist", () => {
    expect(
      computeGoalScore({
        totalKcalIn: 2000,
        dailyKcalTarget: null,
        totalWorkoutMinutes: 30,
        weeklyWorkoutTarget: null,
      }),
    ).toBeNull();
  });

  it("scores nutrition when daily kcal target is set", () => {
    const score = computeGoalScore({
      totalKcalIn: 2000,
      dailyKcalTarget: 2000,
      totalWorkoutMinutes: 0,
      weeklyWorkoutTarget: null,
    });
    expect(score).toBe(100);
  });

  it("blends nutrition and weekly workout targets", () => {
    const score = computeGoalScore({
      totalKcalIn: 2000,
      dailyKcalTarget: 2000,
      totalWorkoutMinutes: 45,
      weeklyWorkoutTarget: 3,
    });
    expect(score).toBeGreaterThan(80);
    expect(score).toBeLessThanOrEqual(100);
  });
});
