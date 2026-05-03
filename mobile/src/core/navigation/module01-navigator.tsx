import type { ReactElement } from "react";
import { createStackNavigator, type StackNavigationOptions } from "@react-navigation/stack";
import type { Module01StackParamList } from "./module01-types";
import { LoginScreen } from "../../features/module01/screens/login-screen";
import { RegisterScreen } from "../../features/module01/screens/register-screen";
import { ForgotPasswordScreen } from "../../features/module01/screens/forgot-password-screen";
import { PasswordEmailSentScreen } from "../../features/module01/screens/password-email-sent-screen";
import { OnboardingGenderScreen } from "../../features/module01/screens/onboarding-gender-screen";
import { OnboardingAgeScreen } from "../../features/module01/screens/onboarding-age-screen";
import { OnboardingBodyScreen } from "../../features/module01/screens/onboarding-body-screen";
import { OnboardingActivityScreen } from "../../features/module01/screens/onboarding-activity-screen";
import { OnboardingGoalScreen } from "../../features/module01/screens/onboarding-goal-screen";
import { OnboardingResultScreen } from "../../features/module01/screens/onboarding-result-screen";
import { MainTabNavigator } from "./main-tab-navigator";

const Stack = createStackNavigator<Module01StackParamList>();

const stackScreenOptions: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: "horizontal",
  cardOverlayEnabled: true,
  cardStyle: { backgroundColor: "transparent" },
};

export function Module01Navigator(): ReactElement {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={stackScreenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PasswordEmailSent" component={PasswordEmailSentScreen} />
      <Stack.Screen name="OnboardingGender" component={OnboardingGenderScreen} />
      <Stack.Screen name="OnboardingAge" component={OnboardingAgeScreen} />
      <Stack.Screen name="OnboardingBody" component={OnboardingBodyScreen} />
      <Stack.Screen name="OnboardingActivity" component={OnboardingActivityScreen} />
      <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
      <Stack.Screen name="OnboardingResult" component={OnboardingResultScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}
