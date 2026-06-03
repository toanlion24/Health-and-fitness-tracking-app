import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { GradientPrimaryButton } from "../../auth/components/gradient-primary-button";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import { colors, iosCardShadow, layout, radii } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";
import { useNotificationsHubStore } from "../store/notifications-hub-store";

export function NotificationsPreferencesScreen({
  navigation,
}: ProfileStackScreenProps<"NotificationsPreferences">): ReactElement {
  const { t } = useTranslation();
  const systemPermissionDenied = useNotificationsHubStore((s) => s.systemPermissionDenied);
  const setSystemPermissionDenied = useNotificationsHubStore((s) => s.setSystemPermissionDenied);

  const [push, setPush] = useState(true);
  const [sound, setSound] = useState(true);
  const [badges, setBadges] = useState(true);
  const [digest, setDigest] = useState(false);
  const [quietHours, setQuietHours] = useState(true);
  const [priorityHigh, setPriorityHigh] = useState(false);

  return (
    <OnboardingLayout variant="onboardingMint" contentInset={[10, 20, 24, 20]} scrollable>
      <View style={{ width: "100%", gap: 16, flex: 1 }}>
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
          <Text style={{ flex: 1, fontFamily: font.extrabold, fontSize: 26, letterSpacing: -0.6, color: colors.slate900 }}>
            {t("notifications.preferencesTitle")}
          </Text>
        </View>

        <View style={[card, { gap: 10 }]}>
          <Text style={sectionLabel}>{t("notifications.sectionGeneral")}</Text>
          <ToggleRow label={t("notifications.pushEnabled")} value={push} onValueChange={setPush} />
          <ToggleRow label={t("notifications.sound")} value={sound} onValueChange={setSound} />
          <ToggleRow label={t("notifications.badges")} value={badges} onValueChange={setBadges} />
          <ToggleRow label={t("notifications.digest")} value={digest} onValueChange={setDigest} />
        </View>

        <View style={[card, { gap: 10 }]}>
          <Text style={sectionLabel}>{t("notifications.sectionBehavior")}</Text>
          <ToggleRow label={t("notifications.quietHours")} value={quietHours} onValueChange={setQuietHours} />
          <ToggleRow label={t("notifications.priority")} value={priorityHigh} onValueChange={setPriorityHigh} />
        </View>

        {systemPermissionDenied ? (
          <View
            style={{
              borderRadius: radii.card,
              padding: 14,
              gap: 8,
              backgroundColor: "#FEF2F2",
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: "#FECACA",
            }}
          >
            <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: "#B91C1C" }}>{t("notifications.permissionTitle")}</Text>
            <Text style={{ fontFamily: font.bold, fontSize: 11, color: "#991B1B", lineHeight: 16, maxWidth: 310 }}>
              {t("notifications.permissionBody")}
            </Text>
          </View>
        ) : null}

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate500, flex: 1 }}>
            {t("notifications.demoPermissionToggle")}
          </Text>
          <Switch
            value={systemPermissionDenied}
            onValueChange={setSystemPermissionDenied}
            trackColor={{ false: colors.slate200, true: colors.orange500 }}
          />
        </View>

        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label={t("notifications.saveSettings")} onPress={() => navigation.goBack()} height={56} />
      </View>
    </OnboardingLayout>
  );
}

function ToggleRow(props: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}): ReactElement {
  const { label, value, onValueChange } = props;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
      <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900, flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.slate200, true: colors.emerald600 }} />
    </View>
  );
}

const sectionLabel = {
  fontFamily: font.extrabold,
  fontSize: 12,
  color: colors.slate500,
  letterSpacing: 0.4,
} as const;

const card = {
  borderRadius: radii.card,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.slate200,
  backgroundColor: colors.white,
  padding: 16,
  ...iosCardShadow,
} as const;
