import type { ReactElement } from "react";
import { createStackNavigator, type StackNavigationOptions } from "@react-navigation/stack";
import type { ProfileStackParamList } from "./profile-stack-types";
import { SettingsAppPreferencesScreen } from "../screens/settings-app-preferences-screen";
import { SettingsChangePasswordScreen } from "../screens/settings-change-password-screen";
import { SettingsEditProfileScreen } from "../screens/settings-edit-profile-screen";
import { SettingsHomeScreen } from "../screens/settings-home-screen";
import { AiCoachPulseScreen } from "../screens/ai-coach-pulse-screen";
import { NotificationsAiCoachScreen } from "../screens/notifications-ai-coach-screen";
import { NotificationsDetailScreen } from "../screens/notifications-detail-screen";
import { NotificationsHubScreen } from "../screens/notifications-hub-screen";
import { NotificationsPreferencesScreen } from "../screens/notifications-preferences-screen";
import { NotificationsReminderSetupScreen } from "../screens/notifications-reminder-setup-screen";
import { SettingsPrivacyScreen } from "../screens/settings-privacy-screen";
import { SettingsSupportScreen } from "../screens/settings-support-screen";

const Stack = createStackNavigator<ProfileStackParamList>();

const options: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: "horizontal",
  cardOverlayEnabled: true,
  cardStyle: { backgroundColor: "transparent" },
};

export function ProfileStackNavigator(): ReactElement {
  return (
    <Stack.Navigator initialRouteName="SettingsHome" screenOptions={options}>
      <Stack.Screen name="SettingsHome" component={SettingsHomeScreen} />
      <Stack.Screen name="EditProfile" component={SettingsEditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={SettingsChangePasswordScreen} />
      <Stack.Screen name="NotificationsSettings" component={NotificationsHubScreen} />
      <Stack.Screen name="NotificationsPreferences" component={NotificationsPreferencesScreen} />
      <Stack.Screen name="NotificationsReminderSetup" component={NotificationsReminderSetupScreen} />
      <Stack.Screen name="NotificationsDetail" component={NotificationsDetailScreen} />
      <Stack.Screen name="NotificationsAiCoach" component={NotificationsAiCoachScreen} />
      <Stack.Screen name="AiCoachPulse" component={AiCoachPulseScreen} />
      <Stack.Screen name="AppPreferences" component={SettingsAppPreferencesScreen} />
      <Stack.Screen name="PrivacySecurity" component={SettingsPrivacyScreen} />
      <Stack.Screen name="Support" component={SettingsSupportScreen} />
    </Stack.Navigator>
  );
}
