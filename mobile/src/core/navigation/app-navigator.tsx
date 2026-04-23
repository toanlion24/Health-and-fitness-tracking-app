import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen } from "../../features/auth/screens/login-screen";
import { PasswordSentScreen } from "../../features/auth/screens/password-sent-screen";
import { RegisterScreen } from "../../features/auth/screens/register-screen";
import { ResetPasswordScreen } from "../../features/auth/screens/reset-password-screen";
import { SplashScreen } from "../../features/auth/screens/splash-screen";
import { WelcomeScreen } from "../../features/auth/screens/welcome-screen";
import { BodyMetricsScreen } from "../../features/metrics/screens/body-metrics-screen";
import { HomeScreen } from "../../features/home/home-screen";
import { RemindersScreen } from "../../features/reminders/reminders-screen";
import { NutritionScreen } from "../../features/nutrition/screens/nutrition-screen";
import { ProfileScreen } from "../../features/profile/profile-screen";
import { WorkoutSessionScreen } from "../../features/workouts/screens/workout-session-screen";
import { WorkoutsScreen } from "../../features/workouts/screens/workouts-screen";
import { useAuthStore } from "../store/auth-store";
import type { AppStackParamList, AuthStackParamList } from "./types";

const AuthStack = createStackNavigator<AuthStackParamList>();
const AppStack = createStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen
        name="Splash"
        component={SplashScreen}
      />
      <AuthStack.Screen
        name="Welcome"
        component={WelcomeScreen}
      />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="PasswordSent" component={PasswordSentScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Trang chủ" }}
      />
      <AppStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Hồ sơ" }}
      />
      <AppStack.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{ title: "Tập luyện" }}
      />
      <AppStack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
        options={{ title: "Buổi tập" }}
      />
      <AppStack.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{ title: "Dinh dưỡng" }}
      />
      <AppStack.Screen
        name="BodyMetrics"
        component={BodyMetricsScreen}
        options={{ title: "Chỉ số cơ thể" }}
      />
      <AppStack.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{ title: "Nhắc nhở" }}
      />
    </AppStack.Navigator>
  );
}

export function AppNavigator() {
  const user = useAuthStore((s) => s.user);

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
