import type { ReactElement } from "react";
import { createStackNavigator, type StackNavigationOptions } from "@react-navigation/stack";
import { WorkoutDetailScreen } from "../screens/workout-detail-screen";
import { WorkoutListScreen } from "../screens/workout-list-screen";
import { WorkoutPlanScreen } from "../screens/workout-plan-screen";
import { WorkoutPlayerScreen } from "../screens/workout-player-screen";
import type { WorkoutStackParamList } from "./workout-stack-types";

const Stack = createStackNavigator<WorkoutStackParamList>();

const options: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: "horizontal",
  cardOverlayEnabled: true,
  cardStyle: { backgroundColor: "transparent" },
};

export function WorkoutStackNavigator(): ReactElement {
  return (
    <Stack.Navigator initialRouteName="WorkoutList" screenOptions={options}>
      <Stack.Screen name="WorkoutList" component={WorkoutListScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="WorkoutPlayer" component={WorkoutPlayerScreen} />
      <Stack.Screen name="WorkoutPlan" component={WorkoutPlanScreen} />
    </Stack.Navigator>
  );
}
