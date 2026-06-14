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

  // ── New edge cases ──────────────────────────────────────────────────────────

  it("returns null when only kcal target is 0", () => {
    expect(
      computeGoalScore({
        totalKcalIn: 500,
        dailyKcalTarget: 0,
        totalWorkoutMinutes: 30,
        weeklyWorkoutTarget: null,
      }),
    ).toBeNull();
  });

  it("treats weekly target of 0 as no target (skipped)", () => {
    // weeklyWorkoutTarget > 0 is required, so 0 is skipped → both targets null → null
    expect(
      computeGoalScore({
        totalKcalIn: 0,
        dailyKcalTarget: null,
        totalWorkoutMinutes: 45,
        weeklyWorkoutTarget: 0,
      }),
    ).toBeNull();
  });

  it("treats daily kcal target of 0 as no target (skipped)", () => {
    // dailyKcalTarget > 0 is required, so 0 is skipped → both targets null → null
    expect(
      computeGoalScore({
        totalKcalIn: 500,
        dailyKcalTarget: 0,
        totalWorkoutMinutes: 30,
        weeklyWorkoutTarget: null,
      }),
    ).toBeNull();
  });

  it("scores 100 when kcal in exactly matches target", () => {
    const score = computeGoalScore({
      totalKcalIn: 1800,
      dailyKcalTarget: 1800,
      totalWorkoutMinutes: 0,
      weeklyWorkoutTarget: null,
    });
    expect(score).toBe(100);
  });

  it("scores lower when kcal in deviates from target", () => {
    const perfect = computeGoalScore({
      totalKcalIn: 2000,
      dailyKcalTarget: 2000,
      totalWorkoutMinutes: 0,
      weeklyWorkoutTarget: null,
    });
    const over = computeGoalScore({
      totalKcalIn: 3000,
      dailyKcalTarget: 2000,
      totalWorkoutMinutes: 0,
      weeklyWorkoutTarget: null,
    });
    expect(Number(over)).toBeLessThan(Number(perfect));
    expect(over).toBeGreaterThan(0);
  });

  it("scores lower when kcal in is far below target", () => {
    const score = computeGoalScore({
      totalKcalIn: 200,
      dailyKcalTarget: 2000,
      totalWorkoutMinutes: 0,
      weeklyWorkoutTarget: null,
    });
    expect(score).toBeLessThan(50);
    expect(score).toBeGreaterThan(0);
  });

  it("caps score at 0 when kcal deviation exceeds 100%", () => {
    const score = computeGoalScore({
      totalKcalIn: 0,
      dailyKcalTarget: 2000,
      totalWorkoutMinutes: 0,
      weeklyWorkoutTarget: null,
    });
    expect(score).toBe(0);
  });

  it("gives workout score based on daily session minutes vs implied daily target", () => {
    const zeroWork = computeGoalScore({
      totalKcalIn: 0,
      dailyKcalTarget: null,
      totalWorkoutMinutes: 0,
      weeklyWorkoutTarget: 3,
    });
    const goodWork = computeGoalScore({
      totalKcalIn: 0,
      dailyKcalTarget: null,
      totalWorkoutMinutes: 45,
      weeklyWorkoutTarget: 3,
    });
    expect(goodWork).toBeGreaterThan(zeroWork!);
  });

  it("caps workout score at 100 when exceeding implied daily minutes", () => {
    const score = computeGoalScore({
      totalKcalIn: 0,
      dailyKcalTarget: null,
      totalWorkoutMinutes: 300,
      weeklyWorkoutTarget: 3,
    });
    expect(score).toBe(100);
  });

  it("blends both scores 50/50 when both targets are set", () => {
    const onlyNutrition = computeGoalScore({
      totalKcalIn: 2000,
      dailyKcalTarget: 2000,
      totalWorkoutMinutes: 0,
      weeklyWorkoutTarget: null,
    });
    const onlyWorkout = computeGoalScore({
      totalKcalIn: 0,
      dailyKcalTarget: null,
      totalWorkoutMinutes: 45,
      weeklyWorkoutTarget: 3,
    });
    const both = computeGoalScore({
      totalKcalIn: 2000,
      dailyKcalTarget: 2000,
      totalWorkoutMinutes: 45,
      weeklyWorkoutTarget: 3,
    });
    expect(both).toBe(Math.round((onlyNutrition! + onlyWorkout!) / 2));
  });

  it("returns integer rounded score", () => {
    const score = computeGoalScore({
      totalKcalIn: 2200,
      dailyKcalTarget: 2000,
      totalWorkoutMinutes: 30,
      weeklyWorkoutTarget: 3,
    });
    expect(Number.isInteger(score)).toBe(true);
  });
});
