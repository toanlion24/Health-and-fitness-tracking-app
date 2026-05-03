import type { StackScreenProps } from "@react-navigation/stack";

export type Module01StackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: { prefilledEmail?: string } | undefined;
  PasswordEmailSent: { email?: string } | undefined;
  OnboardingGender: undefined;
  OnboardingAge: undefined;
  OnboardingBody: undefined;
  OnboardingActivity: undefined;
  OnboardingGoal: undefined;
  OnboardingResult: undefined;
  MainTabs: undefined;
};

export type Module01StackScreenProps<T extends keyof Module01StackParamList> = StackScreenProps<Module01StackParamList, T>;
