export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OnboardingGender: undefined;
  OnboardingAge: undefined;
  OnboardingBody: undefined;
  OnboardingActivity: undefined;
  OnboardingGoal: undefined;
  OnboardingResult: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  MetabolicIndices: undefined;
  Workouts: undefined;
  WorkoutSession: { sessionId: string };
  Nutrition: { date?: string } | undefined;
  BodyMetrics: undefined;
  Reminders: undefined;
};
