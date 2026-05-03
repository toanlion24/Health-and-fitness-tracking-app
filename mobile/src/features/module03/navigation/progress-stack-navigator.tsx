import type { ReactElement } from "react";
import { createStackNavigator, type StackNavigationOptions } from "@react-navigation/stack";
import { ActivityDetailScreen } from "../screens/activity-detail-screen";
import { AddWeightScreen } from "../screens/add-weight-screen";
import { AppFlowMapScreen } from "../screens/app-flow-map-screen";
import { CaloriesDetailScreen } from "../screens/calories-detail-screen";
import { HealthMetricsDetailScreen } from "../screens/health-metrics-detail-screen";
import { MetricsDashboardScreen } from "../screens/metrics-dashboard-screen";
import { WeightDetailScreen } from "../screens/weight-detail-screen";
import type { ProgressStackParamList } from "./progress-stack-types";

const Stack = createStackNavigator<ProgressStackParamList>();

const options: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: "horizontal",
  cardOverlayEnabled: true,
  cardStyle: { backgroundColor: "transparent" },
};

export function ProgressStackNavigator(): ReactElement {
  return (
    <Stack.Navigator initialRouteName="MetricsDashboard" screenOptions={options}>
      <Stack.Screen name="MetricsDashboard" component={MetricsDashboardScreen} />
      <Stack.Screen name="HealthMetricsDetail" component={HealthMetricsDetailScreen} />
      <Stack.Screen name="WeightDetail" component={WeightDetailScreen} />
      <Stack.Screen name="AddWeight" component={AddWeightScreen} />
      <Stack.Screen name="CaloriesDetail" component={CaloriesDetailScreen} />
      <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
      <Stack.Screen name="AppFlowMap" component={AppFlowMapScreen} />
    </Stack.Navigator>
  );
}
