import type { StackScreenProps } from "@react-navigation/stack";

export type AuthStackParamList = {
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

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = StackScreenProps<AuthStackParamList, T>;
