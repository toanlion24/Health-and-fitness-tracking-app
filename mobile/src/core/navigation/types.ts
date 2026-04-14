export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  Workouts: undefined;
  WorkoutSession: { sessionId: string };
  Nutrition: { date?: string } | undefined;
  BodyMetrics: undefined;
};
