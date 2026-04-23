export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ResetPassword: { email?: string } | undefined;
  PasswordSent: { email: string };
};

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  Workouts: undefined;
  WorkoutSession: { sessionId: string };
  Nutrition: { date?: string } | undefined;
  BodyMetrics: undefined;
  Reminders: undefined;
};
