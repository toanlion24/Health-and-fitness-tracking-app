import type { StackScreenProps } from "@react-navigation/stack";

export type ProfileStackParamList = {
  SettingsHome: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  /** Notifications hub (list + tabs) */
  NotificationsSettings: undefined;
  NotificationsPreferences: undefined;
  NotificationsReminderSetup: undefined;
  NotificationsDetail: { id: string };
  NotificationsAiCoach: { initialMessage?: string } | undefined;
  /** Coach Kai · Live Pulse dashboard (pen SjVPS) */
  AiCoachPulse: undefined;
  AppPreferences: undefined;
  PrivacySecurity: undefined;
  Support: undefined;
};

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = StackScreenProps<
  ProfileStackParamList,
  T
>;
