import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { DailyProgressDto, MeResponseDto } from "@health-fitness/shared";
import { useAuthStore } from "../../core/store/auth-store";
import type { AppStackParamList } from "../../core/navigation/types";
import { EmptyState } from "../../core/ui-states/empty-state";
import { ErrorState } from "../../core/ui-states/error-state";
import { LoadingState } from "../../core/ui-states/loading-state";
import { ScreenScroll } from "../../core/ui/screen-scaffold";
import { appTheme } from "../../core/theme/app-theme";
import { apiFetch } from "../../core/api/client";
import { fetchDailyProgressRange } from "../progress/progress-api";
import { readQueue } from "../../core/sync/offline-queue";

type Props = StackScreenProps<AppStackParamList, "Home">;

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function rangeLastDays(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - (days - 1));
  return { from: isoDay(from), to: isoDay(to) };
}

const MENU = [
  {
    title: "Hồ sơ & mục tiêu",
    subtitle: "Cập nhật thông tin cá nhân",
    to: "Profile" as const,
    emoji: "👤",
  },
  {
    title: "Tập luyện",
    subtitle: "Danh mục bài tập, buổi tập",
    to: "Workouts" as const,
    emoji: "🏋️",
  },
  {
    title: "Dinh dưỡng",
    subtitle: "Nhật ký bữa ăn theo ngày",
    to: "Nutrition" as const,
    emoji: "🍽️",
  },
  {
    title: "Chỉ số cơ thể",
    subtitle: "Cân nặng, chỉ số theo thời gian",
    to: "BodyMetrics" as const,
    emoji: "📊",
  },
  {
    title: "Nhắc nhở",
    subtitle: "Nước, tập, bữa ăn — push qua Expo",
    to: "Reminders" as const,
    emoji: "⏰",
  },
];

function CalorieBars({ days }: { days: DailyProgressDto[] }) {
  const maxKcal = Math.max(1, ...days.map((d) => d.totalKcalIn));
  return (
    <View style={styles.chartRow}>
      {days.map((d) => {
        const h = Math.round((d.totalKcalIn / maxKcal) * 96);
        return (
          <View key={d.date} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height: Math.max(4, h) }]} />
            </View>
            <Text style={styles.barLabel} numberOfLines={1}>
              {d.date.slice(8, 10)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [me, setMe] = useState<MeResponseDto | null>(null);
  const [week, setWeek] = useState<DailyProgressDto[] | null>(null);
  const [mode, setMode] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [outbox, setOutbox] = useState(0);

  const load = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [profile, q] = await Promise.all([
        apiFetch<MeResponseDto>("/api/v1/me", { auth: true }),
        readQueue(),
      ]);
      setMe(profile);
      setOutbox(q.length);
      const span = mode === "week" ? 7 : 30;
      const { from, to } = rangeLastDays(span);
      const items = await fetchDailyProgressRange(from, to);
      setWeek(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [user, mode]);

  useEffect(() => {
    void load();
  }, [load]);

  const todayKcal = useMemo(() => {
    const key = isoDay(new Date());
    const row = week?.find((d) => d.date === key);
    return row?.totalKcalIn ?? 0;
  }, [week]);

  const dailyTarget = me?.goals[0]?.dailyKcalTarget ?? null;
  const left =
    dailyTarget != null ? Math.max(0, dailyTarget - todayKcal) : null;

  if (!user) {
    return (
      <EmptyState
        title="Not signed in"
        description="Please sign in to continue."
      />
    );
  }

  if (loading && !week) {
    return <LoadingState message="Đang tải bảng điều khiển..." />;
  }

  if (error && !week) {
    return (
      <ErrorState
        title="Không tải được"
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <ScreenScroll>
      <Text style={styles.greeting}>Xin chào</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Calorie Intake</Text>
        <Text style={styles.heroKcal}>
          {todayKcal.toLocaleString("vi-VN")} kcal
        </Text>
        <Text style={styles.heroSub}>
          {left != null && dailyTarget != null
            ? `Còn khoảng ${left.toLocaleString("vi-VN")} kcal so với mục tiêu ${dailyTarget.toLocaleString("vi-VN")} kcal.`
            : "Cập nhật mục tiêu kcal trong Hồ sơ để xem đủ hay thiếu."}
        </Text>
        <View style={styles.segment}>
          <Pressable
            onPress={() => setMode("week")}
            style={[
              styles.segBtn,
              mode === "week" && styles.segBtnOn,
            ]}
          >
            <Text
              style={[
                styles.segTxt,
                mode === "week" && styles.segTxtOn,
              ]}
            >
              7 ngày
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("month")}
            style={[
              styles.segBtn,
              mode === "month" && styles.segBtnOn,
            ]}
          >
            <Text
              style={[
                styles.segTxt,
                mode === "month" && styles.segTxtOn,
              ]}
            >
              30 ngày
            </Text>
          </Pressable>
        </View>
        {week && week.length > 0 ? (
          <CalorieBars days={week} />
        ) : (
          <Text style={styles.muted}>Chưa có dữ liệu tổng hợp cho khoảng này.</Text>
        )}
      </View>

      {outbox > 0 ? (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            Hàng đợi offline: {outbox} thao tác (đồng bộ sau).
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionLabel}>Lối tắt</Text>
      <View style={styles.grid}>
        {MENU.map((item) => (
          <Pressable
            key={item.to}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              navigation.navigate(item.to, undefined as never)
            }
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
        onPress={() => void logout()}
      >
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: appTheme.colors.text,
  },
  email: {
    marginTop: 4,
    fontSize: 15,
    color: appTheme.colors.textMuted,
  },
  hero: {
    marginTop: appTheme.space.lg,
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    padding: appTheme.space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    ...appTheme.shadow.card,
  },
  heroEyebrow: {
    fontSize: 14,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    marginBottom: 4,
  },
  heroKcal: {
    fontSize: 36,
    fontWeight: "800",
    color: appTheme.colors.text,
    letterSpacing: -0.5,
  },
  heroSub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: appTheme.colors.textSoft,
  },
  segment: {
    flexDirection: "row",
    gap: 8,
    marginTop: appTheme.space.md,
    marginBottom: appTheme.space.sm,
  },
  segBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: appTheme.colors.surfaceMuted,
  },
  segBtnOn: {
    backgroundColor: "#2563eb",
  },
  segTxt: {
    fontWeight: "700",
    fontSize: 14,
    color: appTheme.colors.textMuted,
  },
  segTxtOn: { color: "#ffffff" },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: appTheme.space.sm,
    paddingTop: appTheme.space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: appTheme.colors.border,
  },
  barCol: { alignItems: "center", flex: 1 },
  barTrack: {
    width: 14,
    height: 100,
    borderRadius: 10,
    backgroundColor: appTheme.colors.surfaceMuted,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: appTheme.colors.accent,
    borderRadius: 10,
  },
  barLabel: {
    marginTop: 6,
    fontSize: 10,
    color: appTheme.colors.textMuted,
  },
  muted: {
    marginTop: appTheme.space.sm,
    fontSize: 13,
    color: appTheme.colors.textSoft,
  },
  offlineBanner: {
    marginTop: appTheme.space.md,
    padding: appTheme.space.sm,
    borderRadius: appTheme.radius.md,
    backgroundColor: "#fff7ed",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#fed7aa",
  },
  offlineText: {
    fontSize: 13,
    color: "#9a3412",
    fontWeight: "600",
  },
  sectionLabel: {
    marginTop: appTheme.space.lg,
    fontSize: 16,
    fontWeight: "800",
    color: appTheme.colors.text,
  },
  grid: {
    marginTop: appTheme.space.sm,
    gap: appTheme.space.sm,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    padding: appTheme.space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    ...appTheme.shadow.card,
  },
  cardPressed: {
    opacity: 0.92,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: appTheme.colors.text,
  },
  cardSub: {
    marginTop: 4,
    fontSize: 13,
    color: appTheme.colors.textMuted,
    lineHeight: 18,
  },
  logout: {
    marginTop: appTheme.space.xl,
    alignSelf: "flex-start",
    backgroundColor: appTheme.colors.text,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: appTheme.radius.md,
  },
  logoutPressed: {
    opacity: 0.92,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});
