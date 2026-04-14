import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen } from "../../features/auth/screens/login-screen";
import { RegisterScreen } from "../../features/auth/screens/register-screen";
import { BodyMetricsScreen } from "../../features/metrics/screens/body-metrics-screen";
import { HomeScreen } from "../../features/home/home-screen";
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
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Sign in" }}
      />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Register" }}
      />
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
