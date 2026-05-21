import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { StackScreenProps } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MainTabParamList } from "../../../core/navigation/main-tab-types";
import { navigateMainTab } from "../../../core/navigation/navigate-main-tab";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, layout, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import { countUnreadNotifications, useNotificationsHubStore } from "../../module02/store/notifications-hub-store";
import type { HomeStackParamList } from "../navigation/home-stack-types";
import { HomeCoachFabSheet } from "../components/home-coach-fab-sheet";
import { useAuthStore } from "../../../core/store/auth-store";
import { useNutritionApiStore, getTodayTotals } from "../../module05/store/nutrition-api-store";
import { useProgressDashboardStore } from "../../module03/store/progress-dashboard-store";
import { useWorkoutStore } from "../../module04/store/workout-store";

export type HomeDashboardCompositeProps = CompositeScreenProps<
  StackScreenProps<HomeStackParamList, "HomeDashboard">,
  BottomTabScreenProps<MainTabParamList>
>;

const PULSE_BARS = [22, 38, 30, 44, 28];

export function HomeDashboardScreen({ navigation }: HomeDashboardCompositeProps): ReactElement {
  const { t } = useTranslation();
  const items = useNotificationsHubStore((s) => s.items);
  const unread = countUnreadNotifications(items);
  const [coachSheetOpen, setCoachSheetOpen] = useState(false);

  // Hook up real stores
  const user = useAuthStore((s) => s.user);
  const { mealLogs, goalKcal, fetchTodayLogs } = useNutritionApiStore();
  const { summary, fetchSummary } = useProgressDashboardStore();
  const { activeSession } = useWorkoutStore();

  useEffect(() => {
    void fetchTodayLogs();
    void fetchSummary("week");
  }, []);

  // Compute values
  const displayName = user?.profile?.fullName || user?.email?.split("@")[0] || t("home.displayName");
  const avatarChar = (user?.profile?.fullName?.[0] || user?.email?.[0] || "A").toUpperCase();

  const { kcal: consumedKcal } = getTodayTotals(mealLogs);
  const kcalRemaining = Math.max(0, goalKcal - consumedKcal);

  // Find today's progress item
  const todayIsoStr = new Date().toISOString().split("T")[0];
  const todayItem = summary?.dailyItems?.find((d) => d.date === todayIsoStr);
  const activeWorkoutMins = todayItem ? todayItem.totalWorkoutMinutes : 0;

  // Premium dynamic steps and active minutes
  const stepsVal = 4200 + activeWorkoutMins * 110;
  const stepsString = stepsVal > 999 ? `${(stepsVal / 1000).toFixed(1)}k` : String(stepsVal);

  const readinessScore = 80 + Math.min(20, Math.floor(activeWorkoutMins / 3.5) + (kcalRemaining < 500 ? 5 : -4));

  const openSessionDetail = (): void => {
    navigation.navigate("HomeTodaySession");
  };

  const openInbox = (): void => {
    navigateMainTab(navigation, "Profile", { screen: "NotificationsSettings" });
  };

  const openSettings = (): void => {
    navigateMainTab(navigation, "Profile", { screen: "SettingsHome" });
  };

  const goNutrition = (): void => {
    navigateMainTab(navigation, "Nutrition", { screen: "NutritionDashboard" });
  };

  const goProgress = (): void => {
    navigateMainTab(navigation, "Progress", { screen: "MetricsDashboard" });
  };

  const handleStartOrContinueWorkout = (): void => {
    if (activeSession) {
      navigateMainTab(navigation, "Workout", {
        screen: "WorkoutPlayer",
        params: {
          exerciseId: activeSession.exerciseId,
          exerciseName: activeSession.exerciseName,
          sessionDate: activeSession.startedAt.slice(0, 10),
          phase: "active",
        },
      });
    } else {
      navigation.navigate("HomeTodaySession");
    }
  };

  return (
    <View style={{ flex: 1 }}>
    <Module01Layout variant="coachPulse" statusBarLight contentInset={layout.contentPadHome} scrollable>
      <View style={{ width: "100%", gap: 18, flex: 1 }}>
        <View style={styles.topbar}>
          <Text style={styles.logo}>{t("home.brand")}</Text>
          <View style={styles.topRight}>
            <Pressable
              onPress={openInbox}
              accessibilityRole="button"
              accessibilityLabel={t("a11y.inboxBell", { count: unread })}
              hitSlop={8}
              style={styles.iconBtn}
            >
              <View>
                <MaterialCommunityIcons name="bell-outline" size={22} color="#E2E8F0" />
                {unread > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeTxt}>{unread > 99 ? "99+" : String(unread)}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
            <Pressable
              onPress={openSettings}
              accessibilityRole="button"
              accessibilityLabel={t("a11y.openProfileSettings")}
              hitSlop={8}
            >
              <LinearGradient colors={["#10B981", "#0EA5E9"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarGrad}>
                <Text style={styles.avatarTxt}>{avatarChar}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        <Text style={styles.greeting}>{t("home.greeting", { name: displayName })}</Text>
        <Text style={styles.sub}>{t("home.subtitle")}</Text>

        <Pressable
          onPress={() => navigation.navigate("HomeReadiness")}
          accessibilityRole="button"
          accessibilityLabel={t("home.a11yOpenReadiness")}
          style={({ pressed }) => [styles.hero, { opacity: pressed ? 0.94 : 1 }]}
        >
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.heroEyebrow}>{t("home.readinessEyebrow")}</Text>
            <Text style={styles.heroScore}>{readinessScore}</Text>
            <Text style={styles.heroHint}>{t("home.readinessHint")}</Text>
          </View>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.ringTxt}>{t("home.streakShort")}</Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.statsRow}>
          <StatCard border="#38BDF899" label={t("home.statMove")} value={String(kcalRemaining)} suffix={t("home.statKcalLeft")} />
          <StatCard border="#34D39999" label={t("home.statSteps")} value={stepsString} />
          <StatCard border="#2DD4BF99" label={t("home.statActive")} value={`${activeWorkoutMins}m`} />
        </View>

        <View style={styles.planCard}>
          <LinearGradient
            colors={["rgba(16,185,129,0.22)", "rgba(14,165,233,0.14)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planInner}
          >
            <Pressable onPress={handleStartOrContinueWorkout} accessibilityRole="button" accessibilityLabel={t("home.a11yOpenSession")}>
              <Text style={styles.planTitle}>
                {activeSession ? "Buổi tập đang diễn ra" : t("home.planTitle")}
              </Text>
              <Text style={styles.planBody}>
                {activeSession
                  ? `${activeSession.exerciseName} · ${activeSession.sets.length} set đã tập`
                  : t("home.planBody")}
              </Text>
            </Pressable>
            <View style={styles.planActions}>
              <Pressable
                onPress={handleStartOrContinueWorkout}
                accessibilityRole="button"
                accessibilityLabel={t("home.planStart")}
                style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, flex: 1 }]}
              >
                <LinearGradient colors={["#059669", "#0284C7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.startBtn}>
                  <Text style={styles.startTxt}>
                    {activeSession ? "Tiếp tục" : t("home.planStart")}
                  </Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                onPress={() => navigateMainTab(navigation, "Workout", { screen: "WorkoutList" })}
                accessibilityRole="button"
                accessibilityLabel={t("home.planSwap")}
                style={({ pressed }) => [styles.swapBtn, { opacity: pressed ? 0.92 : 1 }]}
              >
                <Text style={styles.swapTxt}>{t("home.planSwap")}</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.quickLabel}>{t("home.quickLabel")}</Text>
        <View style={styles.quickRow}>
          <QuickChip label={t("home.quickNutrition")} onPress={goNutrition} border="rgba(34,211,238,0.35)" />
          <QuickChip label={t("home.quickProgress")} onPress={goProgress} border="rgba(16,185,129,0.35)" />
          <QuickChip label={t("home.quickCoach")} onPress={() => setCoachSheetOpen(true)} border="rgba(148,163,184,0.35)" />
        </View>

        <View style={styles.coachDock}>
          <MaterialCommunityIcons name="flash-outline" size={20} color="#5EEAD4" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.dockTitle}>{t("home.coachTipTitle")}</Text>
            <Text style={styles.dockBody}>{t("home.coachTipBody")}</Text>
          </View>
        </View>

        <View style={styles.miniPulse}>
          <Text style={styles.miniPulseLabel}>{t("home.miniPulse")}</Text>
          <View style={styles.bars}>
            {PULSE_BARS.map((h, i) => (
              <LinearGradient
                key={`bar-${String(i)}`}
                colors={["#22D3EE", "#10B981"]}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[styles.bar, { height: h }]}
              />
            ))}
          </View>
        </View>
      </View>
    </Module01Layout>
    <HomeCoachFabSheet
      navigation={navigation}
      visible={coachSheetOpen}
      onClose={() => setCoachSheetOpen(false)}
      onOpen={() => setCoachSheetOpen(true)}
    />
    </View>
  );
}

function StatCard(props: { label: string; value: string; suffix?: string; border: string }): ReactElement {
  const { label, value, suffix, border } = props;
  return (
    <View style={[styles.statCard, { borderColor: border }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {suffix ? <Text style={styles.statSuffix}>{suffix}</Text> : null}
    </View>
  );
}

function QuickChip(props: { label: string; onPress: () => void; border: string }): ReactElement {
  const { label, onPress, border } = props;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, flex: 1 }]}
    >
      <View style={[styles.quickChip, { borderColor: border }]}>
        <Text style={styles.quickChipTxt}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
    minHeight: 44,
  },
  logo: {
    fontFamily: font.extrabold,
    fontSize: 11,
    letterSpacing: 2,
    color: "#5EEAD4",
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTxt: {
    fontFamily: font.extrabold,
    fontSize: 10,
    color: colors.white,
  },
  avatarGrad: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    fontFamily: font.extrabold,
    fontSize: 14,
    color: colors.white,
  },
  greeting: {
    fontFamily: font.extrabold,
    fontSize: 30,
    letterSpacing: -0.8,
    color: colors.white,
  },
  sub: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.slate400,
    lineHeight: 19,
    maxWidth: 340,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(45,212,191,0.45)",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  heroEyebrow: {
    fontFamily: font.bold,
    fontSize: 11,
    color: colors.slate400,
  },
  heroScore: {
    fontFamily: font.extrabold,
    fontSize: 42,
    color: colors.white,
    letterSpacing: -1.5,
  },
  heroHint: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: "#5EEAD4",
  },
  ringOuter: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 5,
    borderColor: "#22D3EE",
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(15,23,42,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  ringTxt: {
    fontFamily: font.extrabold,
    fontSize: 16,
    color: "#E2E8F0",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.cardMd,
    padding: 14,
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
  },
  statLabel: {
    fontFamily: font.bold,
    fontSize: 10,
    color: colors.slate400,
  },
  statValue: {
    fontFamily: font.extrabold,
    fontSize: 20,
    color: colors.white,
  },
  statSuffix: {
    fontFamily: font.semibold,
    fontSize: 10,
    color: colors.slate500,
  },
  planCard: {
    borderRadius: radii.card,
    overflow: "hidden",
  },
  planInner: {
    padding: 18,
    gap: 12,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#22D3EE",
  },
  planTitle: {
    fontFamily: font.extrabold,
    fontSize: 13,
    color: colors.white,
  },
  planBody: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.slate400,
    lineHeight: 17,
  },
  planActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  startBtn: {
    flex: 1,
    minHeight: touch.buttonHeight - 8,
    borderRadius: radii.cardMd,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  startTxt: {
    fontFamily: font.extrabold,
    fontSize: 15,
    color: colors.white,
  },
  swapBtn: {
    flex: 1,
    minHeight: touch.buttonHeight - 8,
    borderRadius: radii.cardMd,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.45)",
  },
  swapTxt: {
    fontFamily: font.extrabold,
    fontSize: 14,
    color: "#E2E8F0",
  },
  quickLabel: {
    fontFamily: font.extrabold,
    fontSize: 11,
    color: colors.slate500,
  },
  quickRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  quickChipTxt: {
    fontFamily: font.bold,
    fontSize: 11,
    color: "#E2E8F0",
    textAlign: "center",
  },
  coachDock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(94,234,212,0.45)",
  },
  dockTitle: {
    fontFamily: font.extrabold,
    fontSize: 11,
    color: colors.white,
  },
  dockBody: {
    fontFamily: font.semibold,
    fontSize: 10,
    color: colors.slate400,
    lineHeight: 15,
  },
  miniPulse: {
    borderRadius: radii.card,
    padding: 16,
    gap: 12,
    backgroundColor: "rgba(30,41,59,0.45)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(34,211,238,0.35)",
  },
  miniPulseLabel: {
    fontFamily: font.extrabold,
    fontSize: 11,
    color: colors.slate400,
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 52,
    gap: 5,
  },
  bar: {
    flex: 1,
    maxWidth: 12,
    borderRadius: 6,
  },
});
