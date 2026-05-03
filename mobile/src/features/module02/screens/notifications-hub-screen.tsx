import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, iosCardShadow, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";
import {
  countUnreadNotifications,
  filterNotificationsForTab,
  type HubNotificationItem,
  type NotificationsHubTab,
  useNotificationsHubStore,
} from "../store/notifications-hub-store";

export function NotificationsHubScreen({ navigation }: ProfileStackScreenProps<"NotificationsSettings">): ReactElement {
  const { t } = useTranslation();
  const items = useNotificationsHubStore((s) => s.items);
  const [tab, setTab] = useState<NotificationsHubTab>("all");
  const [loading, setLoading] = useState(true);
  const unread = countUnreadNotifications(items);

  useEffect(() => {
    const tmr = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(tmr);
  }, []);

  const filtered = filterNotificationsForTab(items, tab);

  const openDetail = useCallback(
    (id: string) => {
      navigation.navigate("NotificationsDetail", { id });
    },
    [navigation]
  );

  return (
    <Module01Layout variant="onboardingBlue" contentInset={layout.contentPadSettingsMain} scrollable>
      <View style={{ width: "100%", gap: 14, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.goBack")}
            hitSlop={12}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
          </Pressable>
          <Text style={{ flex: 1, fontFamily: font.extrabold, fontSize: 30, letterSpacing: -0.8, color: colors.slate900 }}>
            {t("notifications.hubTitle")}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("a11y.inboxBell", { count: unread })}
            hitSlop={8}
            style={iconBtn}
            onPress={() => undefined}
          >
            <View style={{ position: "relative" }}>
              <MaterialCommunityIcons name="bell-outline" size={22} color={colors.slate900} />
              {unread > 0 ? (
                <View style={badgeWrap}>
                  <Text style={badgeText}>{unread > 99 ? "99+" : String(unread)}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("AiCoachPulse")}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.openLivePulse")}
            hitSlop={10}
            style={iconBtn}
          >
            <MaterialCommunityIcons name="heart-pulse" size={22} color={colors.slate900} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("NotificationsPreferences")}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.notificationSettings")}
            hitSlop={10}
            style={iconBtn}
          >
            <MaterialCommunityIcons name="cog-outline" size={22} color={colors.slate900} />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("NotificationsAiCoach")}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.openFitnessCoach")}
            hitSlop={10}
            style={iconBtn}
          >
            <MaterialCommunityIcons name="robot-outline" size={22} color={colors.slate900} />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <TabChip label={t("notifications.tabAll")} selected={tab === "all"} onPress={() => setTab("all")} />
          <TabChip label={t("notifications.tabWorkouts")} selected={tab === "workouts"} onPress={() => setTab("workouts")} />
          <TabChip label={t("notifications.tabNutrition")} selected={tab === "nutrition"} onPress={() => setTab("nutrition")} />
        </View>

        <Pressable
          onPress={() => navigation.navigate("NotificationsReminderSetup")}
          accessibilityRole="button"
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.cyan600 }}>{t("notifications.linkReminderSetup")}</Text>
        </Pressable>

        {loading ? (
          <View style={{ paddingVertical: 48, alignItems: "center", gap: 12 }}>
            <ActivityIndicator color={colors.emerald600} />
            <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>{t("notifications.loading")}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <View style={{ gap: 12 }}>
            {filtered.map((n) => (
              <NotificationRow key={n.id} item={n} onPress={() => openDetail(n.id)} />
            ))}
          </View>
        )}
      </View>
    </Module01Layout>
  );
}

function EmptyState(): ReactElement {
  const { t } = useTranslation();
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40, gap: 10 }}>
      <View
        style={{
          width: 74,
          height: 74,
          borderRadius: 37,
          backgroundColor: colors.slate200,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name="bell-off-outline" size={34} color={colors.slate500} />
      </View>
      <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: colors.slate900 }}>{t("notifications.emptyTitle")}</Text>
      <Text
        style={{
          fontFamily: font.semibold,
          fontSize: 12,
          color: colors.slate400,
          textAlign: "center",
          maxWidth: 280,
          lineHeight: 18,
        }}
      >
        {t("notifications.emptyBody")}
      </Text>
    </View>
  );
}

function TabChip(props: { label: string; selected: boolean; onPress: () => void }): ReactElement {
  const { label, selected, onPress } = props;
  if (selected) {
    return (
      <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: true }} style={{ flex: 1 }}>
        <LinearGradient colors={["#059669", "#0284C7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={tabChipInner}>
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.white }}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: false }}
      style={({ pressed }) => [
        tabChipOutline,
        {
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900 }}>{label}</Text>
    </Pressable>
  );
}

const tabChipInner = {
  borderRadius: radii.cardMd,
  paddingVertical: 8,
  paddingHorizontal: 14,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const tabChipOutline = {
  flex: 1,
  borderRadius: radii.cardMd,
  paddingVertical: 8,
  paddingHorizontal: 14,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: colors.slate200,
  backgroundColor: colors.white,
};

const iconBtn = {
  width: 40,
  height: 40,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const badgeWrap = {
  position: "absolute" as const,
  top: -4,
  right: -8,
  minWidth: 18,
  height: 18,
  paddingHorizontal: 5,
  borderRadius: 999,
  backgroundColor: "#EF4444",
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const badgeText = {
  fontFamily: font.extrabold,
  fontSize: 10,
  color: colors.white,
};

function NotificationRow(props: { item: HubNotificationItem; onPress: () => void }): ReactElement {
  const { t } = useTranslation();
  const { item, onPress } = props;
  const hi = item.highlight === true;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t("a11y.notificationItem")}: ${item.title}`}
      style={({ pressed }) => [
        {
          borderRadius: 20,
          minHeight: 82,
          paddingVertical: 15,
          paddingHorizontal: 14,
          gap: 6,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: hi ? "#86EFAC" : colors.slate200,
          backgroundColor: hi ? "#ECFDF5" : colors.white,
          ...iosCardShadow,
          opacity: pressed ? 0.96 : 1,
        },
      ]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <Text style={{ fontFamily: font.extrabold, fontSize: 14, color: colors.slate900, flex: 1 }} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={{ fontFamily: font.bold, fontSize: 11, color: colors.slate400 }}>{item.timeLabel}</Text>
      </View>
      <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500 }} numberOfLines={2}>
        {item.subtitle}
      </Text>
    </Pressable>
  );
}
