import { create } from "zustand";

export type Gender = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "very";
export type Goal = "lose" | "gain" | "maintain";

export type Module01Profile = {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
};

type Module01State = Module01Profile & {
  setGender: (g: Gender) => void;
  setAge: (n: number) => void;
  setHeightCm: (n: number) => void;
  setWeightKg: (n: number) => void;
  setActivity: (a: ActivityLevel) => void;
  setGoal: (g: Goal) => void;
  resetProfile: () => void;
};

const initial: Module01Profile = {
  gender: "male",
  age: 28,
  heightCm: 174,
  weightKg: 72,
  activity: "moderate",
  goal: "gain",
};

export const useModule01Store = create<Module01State>((set) => ({
  ...initial,
  setGender: (gender) => set({ gender }),
  setAge: (age) => set({ age }),
  setHeightCm: (heightCm) => set({ heightCm }),
  setWeightKg: (weightKg) => set({ weightKg }),
  setActivity: (activity) => set({ activity }),
  setGoal: (goal) => set({ goal }),
  resetProfile: () => set(initial),
}));
