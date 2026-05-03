import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, iosCardShadow, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";
import { useNotificationsHubStore } from "../store/notifications-hub-store";

export function NotificationsDetailScreen({
  navigation,
  route,
}: ProfileStackScreenProps<"NotificationsDetail">): ReactElement {
  const { t } = useTranslation();
  const id = route.params.id;
  const item = useNotificationsHubStore((s) => s.items.find((n) => n.id === id));
  const dismiss = useNotificationsHubStore((s) => s.dismiss);
  const markRead = useNotificationsHubStore((s) => s.markRead);

  useEffect(() => {
    markRead(id);
  }, [id, markRead]);

  if (!item) {
    return (
      <Module01Layout variant="onboardingBlue" contentInset={layout.contentPadSettingsDetail} scrollable>
        <Text style={{ fontFamily: font.semibold, fontSize: 14, color: colors.slate500 }}>{t("notifications.emptyTitle")}</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.cyan600 }}>{t("a11y.goBack")}</Text>
        </Pressable>
      </Module01Layout>
    );
  }

  const onDismiss = (): void => {
    dismiss(item.id);
    navigation.goBack();
  };

  return (
    <Module01Layout variant="onboardingBlue" contentInset={[6, 20, 18, 20]} scrollable>
      <View style={{ width: "100%", gap: 14, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.goBack")}
            hitSlop={12}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
          </Pressable>
          <Text
            style={{ flex: 1, fontFamily: font.extrabold, fontSize: 22, color: colors.slate900 }}
            numberOfLines={1}
          >
            {t("notifications.detailTitle")}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderRadius: radii.card,
            padding: 14,
            backgroundColor: "#ECFDF5",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: "#86EFAC",
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: "#D1FAE5",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name={item.category === "workout" ? "dumbbell" : item.category === "nutrition" ? "cup-water" : "bell-ring-outline"}
              size={22}
              color={colors.emerald600}
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontFamily: font.extrabold, fontSize: 15, color: colors.slate900 }}>{item.title}</Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500 }}>{item.subtitle}</Text>
          </View>
        </View>

        <View
          style={{
            borderRadius: radii.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            padding: 16,
            gap: 10,
            ...iosCardShadow,
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>{t("notifications.fullMessage")}</Text>
          <Text style={{ fontFamily: font.semibold, fontSize: 14, color: colors.slate700, lineHeight: 21 }}>{item.body}</Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={{ gap: 8 }}>
          {item.category === "workout" ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("notifications.startWorkout")}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={["#059669", "#0284C7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: radii.btn,
                  height: 54,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: font.extrabold, fontSize: 15, color: colors.white }}>
                  {t("notifications.startWorkout")}
                </Text>
              </LinearGradient>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel={t("notifications.dismiss")}
            style={{
              borderRadius: radii.btn,
              height: 54,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.slate200,
              backgroundColor: colors.white,
            }}
          >
            <Text style={{ fontFamily: font.extrabold, fontSize: 15, color: colors.slate700 }}>{t("notifications.dismiss")}</Text>
          </Pressable>
        </View>
      </View>
    </Module01Layout>
  );
}
