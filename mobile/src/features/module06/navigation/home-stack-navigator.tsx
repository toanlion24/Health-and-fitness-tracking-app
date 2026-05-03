import type { ReactElement } from "react";
import { createStackNavigator, type StackNavigationOptions } from "@react-navigation/stack";
import { HomeDashboardScreen } from "../screens/home-dashboard-screen";
import { HomeReadinessScreen } from "../screens/home-readiness-screen";
import { HomeTodaySessionScreen } from "../screens/home-today-session-screen";
import type { HomeStackParamList } from "./home-stack-types";

const Stack = createStackNavigator<HomeStackParamList>();

const options: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: "horizontal",
  cardOverlayEnabled: true,
  cardStyle: { backgroundColor: "transparent" },
};

export function HomeStackNavigator(): ReactElement {
  return (
    <Stack.Navigator initialRouteName="HomeDashboard" screenOptions={options}>
      <Stack.Screen name="HomeDashboard" component={HomeDashboardScreen} />
      <Stack.Screen name="HomeTodaySession" component={HomeTodaySessionScreen} />
      <Stack.Screen name="HomeReadiness" component={HomeReadinessScreen} />
    </Stack.Navigator>
  );
}
