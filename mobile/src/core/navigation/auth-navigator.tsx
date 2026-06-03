import type { ReactElement } from "react";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { createStackNavigator, type StackNavigationOptions } from "@react-navigation/stack";
import type { AuthStackParamList } from "./auth-types";
import { LoginScreen } from "../../features/auth/screens/login-screen";
import { RegisterScreen } from "../../features/auth/screens/register-screen";
import { ForgotPasswordScreen } from "../../features/auth/screens/forgot-password-screen";
import { PasswordEmailSentScreen } from "../../features/auth/screens/password-email-sent-screen";
import { OnboardingGenderScreen } from "../../features/auth/screens/onboarding-gender-screen";
import { OnboardingAgeScreen } from "../../features/auth/screens/onboarding-age-screen";
import { OnboardingBodyScreen } from "../../features/auth/screens/onboarding-body-screen";
import { OnboardingActivityScreen } from "../../features/auth/screens/onboarding-activity-screen";
import { OnboardingGoalScreen } from "../../features/auth/screens/onboarding-goal-screen";
import { OnboardingResultScreen } from "../../features/auth/screens/onboarding-result-screen";
import { MainTabNavigator } from "./main-tab-navigator";
import { useAuthStore } from "../store/auth-store";

const Stack = createStackNavigator<AuthStackParamList>();

const stackScreenOptions: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: "horizontal",
  cardOverlayEnabled: true,
  cardStyle: { backgroundColor: "transparent" },
};

export function AuthNavigator(): ReactElement {
  const hydrate = useAuthStore((s) => s.hydrate);
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const needsOnboarding = useAuthStore((s) => s.needsOnboarding);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0F172A" }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // Xác định màn hình khởi đầu tối ưu tùy theo trạng thái phiên đăng nhập
  const initialRoute = user ? (needsOnboarding ? "OnboardingGender" : "MainTabs") : "Login";

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={stackScreenOptions}>
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
