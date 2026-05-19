import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  FlatList,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { WorkoutStackScreenProps } from "../navigation/workout-stack-types";
import { useAuthStore } from "../../../core/store/auth-store";
import { listRunningSessions } from "../services/running-api";
import { fmtDistance, fmtDuration, fmtPace } from "../store/running-session-store";
import type { RunningSessionDto } from "@health-fitness/shared";

export function RunningHistoryScreen({
  navigation,
}: WorkoutStackScreenProps<"RunningHistory">): ReactElement {
  const { _t } = useTranslation();
  const accessToken = useAuthStore((s) => s.tokens?.accessToken);

  const [sessions, setSessions] = useState<RunningSessionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await listRunningSessions(accessToken);
      setSessions(data.filter((s) => s.status === "completed"));
      setError(null);
    } catch {
      setError("Không thể tải lịch sử chạy.");
    }
  }

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, [accessToken]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, []);

  const handleStartRun = useCallback(() => {
    navigation.navigate("RunningTracker");
  }, [navigation]);

  // Compute weekly summary
  const weeklySummary = (() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysFromMonday);
    monday.setHours(0, 0, 0, 0);

    const weekSessions = sessions.filter((s) => {
      const d = new Date(s.sessionDate + "T00:00:00.000Z");
      return d >= monday;
    });

    const totalDist = weekSessions.reduce((sum, s) => sum + (s.totalDistanceM ?? 0), 0);
    const totalDur = weekSessions.reduce((sum, s) => sum + (s.totalDurationSec ?? 0), 0);
    const totalKcal = weekSessions.reduce((sum, s) => sum + (s.kcalBurned ?? 0), 0);
    const bestPace = weekSessions.reduce(
      (best, s) => (s.avgPaceSecPerKm > 0 && s.avgPaceSecPerKm < best ? s.avgPaceSecPerKm : best),
      Infinity,
    );

    return {
      count: weekSessions.length,
      totalDist,
      totalDur,
      totalKcal,
      bestPace: isFinite(bestPace) ? bestPace : 0,
    };
  })();

  if (isLoading) {
    return (
      <Module01Layout variant="onboardingBlue" contentInset={[8, 20, 12, 20]} scrollable={false}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
          </Pressable>
          <Text style={{ fontFamily: font.extrabold, fontSize: 20, color: colors.slate900 }}>
            🏃 Lịch sử chạy
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.slate700} />
        </View>
      </Module01Layout>
    );
  }

  return (
    <Module01Layout variant="onboardingBlue" contentInset={[8, 20, 12, 20]} scrollable={false}>
      <View style={{ flex: 1, gap: 14 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.extrabold, fontSize: 20, color: colors.slate900 }}>
              🏃 Lịch sử chạy
            </Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate500 }}>
              {sessions.length} buổi đã ghi nhận
            </Text>
          </View>
        </View>

        {/* Weekly summary */}
        <View style={{ backgroundColor: colors.white, borderRadius: 16, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons name="calendar-week" size={16} color="#0284C7" />
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate900 }}>
              Tuần này
            </Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate500, marginLeft: "auto" }}>
              {weeklySummary.count} buổi
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { label: "Quãng đường", value: fmtDistance(weeklySummary.totalDist), icon: "map-marker-distance", color: "#059669" },
              { label: "Thời gian", value: fmtDuration(weeklySummary.totalDur), icon: "timer-outline", color: "#0284C7" },
              { label: "Calories", value: `${weeklySummary.totalKcal}`, icon: "fire", color: "#DC2626" },
              { label: "Pace TB", value: weeklySummary.bestPace > 0 ? fmtPace(weeklySummary.bestPace) : "—", icon: "speedometer", color: "#7C3AED" },
            ].map((item) => (
              <View key={item.label} style={{ flex: 1, backgroundColor: colors.slate50, borderRadius: 10, padding: 10, alignItems: "center", gap: 4 }}>
                <MaterialCommunityIcons name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={14} color={item.color} />
                <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: colors.slate900 }}>{item.value}</Text>
                <Text style={{ fontFamily: font.semibold, fontSize: 9, color: colors.slate500 }}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Start run CTA */}
        <Pressable
          onPress={handleStartRun}
          style={{ width: "100%" }}
          accessibilityRole="button"
          accessibilityLabel="Bắt đầu chạy bộ"
        >
          <LinearGradient
            colors={["#059669", "#0284C7"]}
            style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
          >
            <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: colors.white }}>
              🚀 Bắt đầu buổi chạy mới
            </Text>
          </LinearGradient>
        </Pressable>

        {error && (
          <View style={{ backgroundColor: "#FEE2E2", borderRadius: 10, padding: 12 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: "#991B1B" }}>{error}</Text>
          </View>
        )}

        {/* Sessions list */}
        {sessions.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
            <MaterialCommunityIcons name="run-fast" size={56} color={colors.slate300} />
            <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.slate500, textAlign: "center" }}>
              Chưa có buổi chạy nào
            </Text>
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate400, textAlign: "center" }}>
              Nhấn "Bắt đầu chạy" để bắt đầu theo dõi
            </Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => String(item.id)}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
            }
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => {
              const km = (item.totalDistanceM / 1000).toFixed(2);
              const mins = Math.round(item.totalDurationSec / 60);
              return (
                <Pressable
                  onPress={() => navigation.navigate("RunningDetail", { sessionId: item.id })}
                  style={({ pressed }) => [
                    {
                      backgroundColor: colors.white,
                      borderRadius: 16,
                      padding: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" }}>
                    <MaterialCommunityIcons name="run-fast" size={24} color="#059669" />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>
                      {km} km
                    </Text>
                    <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500 }}>
                      {item.sessionDate} · {mins} phút · Pace TB {avgPaceStr}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={colors.slate300} />
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Module01Layout>
  );
}
