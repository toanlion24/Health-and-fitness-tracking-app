import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet } from "react-native";
import { HomeStackNavigator } from "../../features/module06/navigation/home-stack-navigator";
import { ProgressStackNavigator } from "../../features/module03/navigation/progress-stack-navigator";
import { NutritionStackNavigator } from "../../features/module05/navigation/nutrition-stack-navigator";
import { WorkoutStackNavigator } from "../../features/module04/navigation/workout-stack-navigator";
import { ProfileStackNavigator } from "../../features/module02/navigation/profile-stack-navigator";
import { font } from "../../features/module01/theme/fonts";
import { colors } from "../../features/module01/theme/tokens";
import type { MainTabParamList } from "./main-tab-types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator(): ReactElement {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      initialRouteName="Home"
      detachInactiveScreens={false}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.emerald600,
        tabBarInactiveTintColor: colors.slate400,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.slate200,
          paddingTop: Platform.OS === "ios" ? 8 : 6,
          height: Platform.OS === "ios" ? 56 : 58,
          ...Platform.select({
            ios: {
              borderTopWidth: StyleSheet.hairlineWidth,
              shadowColor: "#0F172A",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.07,
              shadowRadius: 12,
            },
            default: {
              borderTopWidth: 1,
              elevation: 12,
            },
          }),
        },
        tabBarLabelStyle: {
          fontFamily: font.semibold,
          fontSize: 11,
        },
        tabBarItemStyle: { paddingBottom: 4 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: t("tabs.home"),
          tabBarAccessibilityLabel: "Home dashboard",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Workout"
        component={WorkoutStackNavigator}
        options={{
          tabBarLabel: t("tabs.workout"),
          tabBarAccessibilityLabel: "Workout, list detail and player",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="dumbbell" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Nutrition"
        component={NutritionStackNavigator}
        options={{
          tabBarLabel: t("tabs.nutrition"),
          tabBarAccessibilityLabel: "Nutrition dashboard and meals",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="food-apple-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressStackNavigator}
        options={{
          tabBarLabel: t("tabs.progress"),
          tabBarAccessibilityLabel: "Progress overview and details",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="chart-line" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: t("tabs.profile"),
          tabBarAccessibilityLabel: "Profile and settings",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-cog-outline" color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate("Profile", {
              screen: "SettingsHome",
              merge: true,
            });
          },
        })}
      />
    </Tab.Navigator>
  );
}
