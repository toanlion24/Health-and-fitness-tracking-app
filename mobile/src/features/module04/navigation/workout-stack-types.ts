import type { StackScreenProps } from "@react-navigation/stack";

export type WorkoutPlayerPhase = "active" | "paused" | "completed";

export type WorkoutStackParamList = {
  WorkoutList: undefined;
  WorkoutDetail: { exerciseId: string };
  WorkoutPlayer: { exerciseId: string; phase?: WorkoutPlayerPhase };
  WorkoutPlan: undefined;
};

export type WorkoutStackScreenProps<T extends keyof WorkoutStackParamList> = StackScreenProps<WorkoutStackParamList, T>;
