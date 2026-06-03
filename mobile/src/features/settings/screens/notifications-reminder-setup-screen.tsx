import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { GradientPrimaryButton } from "../../auth/components/gradient-primary-button";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import { colors, iosCardShadow, radii } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";

export function NotificationsReminderSetupScreen({
  navigation,
}: ProfileStackScreenProps<"NotificationsReminderSetup">): ReactElement {
  const { t } = useTranslation();
  const [workoutOn, setWorkoutOn] = useState(true);
  const [workoutTime, setWorkoutTime] = useState("07:00");
  const [waterOn, setWaterOn] = useState(true);
  const [waterEvery, setWaterEvery] = useState("2 h");
  const [customTitle, setCustomTitle] = useState("Stretch break");
  const [saved, setSaved] = useState(false);

  const save = (): void => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <OnboardingLayout variant="onboardingMint" contentInset={[8, 20, 24, 20]} scrollable>
      <View style={{ width: "100%", gap: 14, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.goBack")}
            hitSlop={12}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
          </Pressable>
          <Text style={{ flex: 1, fontFamily: font.extrabold, fontSize: 24, color: colors.slate900 }}>
            {t("notifications.reminderSetupTitle")}
          </Text>
        </View>

        <View style={[card, { gap: 10 }]}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 13, color: colors.slate900 }}>{t("notifications.workoutReminder")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>{t("notifications.enabled")}</Text>
            <Switch value={workoutOn} onValueChange={setWorkoutOn} trackColor={{ false: colors.slate200, true: colors.emerald600 }} />
          </View>
          <Pressable
            onPress={() => setWorkoutTime(workoutTime === "07:00" ? "18:30" : "07:00")}
            style={pickRow}
            accessibilityRole="button"
            accessibilityLabel={`${t("notifications.time")}: ${workoutTime}`}
          >
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>{t("notifications.time")}</Text>
            <Text style={{ fontFamily: font.extrabold, fontSize: 13, color: colors.slate900 }}>{workoutTime}</Text>
          </Pressable>
        </View>

        <View style={[card, { gap: 10 }]}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 13, color: colors.slate900 }}>{t("notifications.waterReminder")}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>{t("notifications.enabled")}</Text>
            <Switch value={waterOn} onValueChange={setWaterOn} trackColor={{ false: colors.slate200, true: colors.emerald600 }} />
          </View>
          <Pressable
            onPress={() => setWaterEvery(waterEvery === "2 h" ? "90 min" : "2 h")}
            style={pickRow}
            accessibilityRole="button"
          >
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>{t("notifications.interval")}</Text>
            <Text style={{ fontFamily: font.extrabold, fontSize: 13, color: colors.slate900 }}>{waterEvery}</Text>
          </Pressable>
        </View>

        <View style={[card, { gap: 10 }]}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 13, color: colors.slate900 }}>{t("notifications.customReminder")}</Text>
          <Pressable
            onPress={() => setCustomTitle(customTitle === "Stretch break" ? "Posture check" : "Stretch break")}
            style={pickRow}
            accessibilityRole="button"
          >
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>{t("notifications.customReminder")}</Text>
            <Text style={{ fontFamily: font.extrabold, fontSize: 13, color: colors.slate900 }} numberOfLines={1}>
              {customTitle}
            </Text>
          </Pressable>
        </View>

        {saved ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: radii.cardMd,
              backgroundColor: "#ECFDF5",
            }}
          >
            <MaterialCommunityIcons name="check" size={14} color={colors.emerald600} />
            <Text style={{ fontFamily: font.bold, fontSize: 11, color: "#047857" }}>{t("notifications.reminderSaved")}</Text>
          </View>
        ) : null}

        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label={t("notifications.saveReminders")} onPress={save} height={56} />
      </View>
    </OnboardingLayout>
  );
}

const card = {
  borderRadius: radii.card,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.slate200,
  backgroundColor: colors.white,
  padding: 16,
  ...iosCardShadow,
} as const;

const pickRow = {
  flexDirection: "row" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingVertical: 10,
  paddingHorizontal: 12,
  borderRadius: radii.cardMd,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.slate200,
  backgroundColor: colors.slate100,
};
