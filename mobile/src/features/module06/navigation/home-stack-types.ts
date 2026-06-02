import type { StackScreenProps } from "@react-navigation/stack";

export type HomeStackParamList = {
  HomeDashboard: undefined;
  /** Expand “Today’s session” card — tempo + CTAs into workout flows */
  HomeTodaySession: undefined;
  /** Tap readiness hero — score breakdown */
  HomeReadiness: undefined;
  StepTracking: undefined;
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = StackScreenProps<HomeStackParamList, T>;
