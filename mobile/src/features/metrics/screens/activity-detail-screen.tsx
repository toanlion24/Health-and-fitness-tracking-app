import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import { ProgressWeekMonthSegment } from "../components/progress-dashboard-widgets";
import { colors, iosCardShadow, layout, radii } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import type { ProgressStackScreenProps } from "../navigation/progress-stack-types";
import { useProgressDashboardStore } from "../store/progress-dashboard-store";

function getDayLabel(dateStr: string, period: "week" | "month"): string {
  const date = new Date(dateStr);
  if (period === "week") {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return days[date.getDay()] ?? "";
  }
  return String(date.getDate());
}

export function ActivityDetailScreen(_props: ProgressStackScreenProps<"ActivityDetail">): ReactElement {
  const [wm, setWm] = useState<"week" | "month">("week");
  
  const { summary, fetchSummary, phase } = useProgressDashboardStore();

  useEffect(() => {
    void fetchSummary(wm);
  }, [wm]);

  const items = summary?.dailyItems ?? [];
  const workoutVals = items.map((d) => d.totalWorkoutMinutes);
  const maxH = Math.max(10, ...workoutVals);
  const isLoading = phase === "loading";

  // Reversely sort to show latest first
  const displayItems = [...items].reverse();

  return (
    <OnboardingLayout variant="metricsDash" contentInset={layout.contentPadProgressDetail} scrollable>
      <View style={{ width: "100%", gap: 18, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 26, color: colors.slate900 }}>Vận động</Text>
          <ProgressWeekMonthSegment value={wm} onChange={setWm} />
        </View>

        <View
          style={{
            borderRadius: radii.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            padding: 18,
            gap: 12,
            ...iosCardShadow,
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Xu hướng tập luyện (Phút)</Text>
          
          {isLoading ? (
            <View style={{ height: 160, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator color={colors.cyan600} size="large" />
            </View>
          ) : items.length === 0 ? (
            <View style={{ height: 160, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate400 }}>
                Chưa có dữ liệu cho khoảng thời gian này
              </Text>
            </View>
          ) : (
            <>
              <View
                style={{
                  height: 160,
                  borderRadius: radii.cardMd,
                  backgroundColor: colors.slate100,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: wm === "month" ? 4 : 10,
                }}
              >
                {items.map((item, i) => (
                  <View key={`${item.date}-${i}`} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                    <LinearGradient
                      colors={["#06B6D4", "#0891B2"]}
                      style={{
                        width: "100%",
                        height: Math.max(4, (item.totalWorkoutMinutes / maxH) * 130),
                        borderRadius: 4,
                      }}
                    />
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 2 }}>
                {items.map((item, i) => {
                  const showLabel = wm === "week" || i % 5 === 0 || i === items.length - 1;
                  return (
                    <Text
                      key={`${item.date}-lbl-${i}`}
                      style={{
                        fontFamily: font.regular,
                        fontSize: 10,
                        color: colors.slate400,
                        width: wm === "month" ? 22 : undefined,
                        textAlign: "center",
                        opacity: showLabel ? 1 : 0,
                      }}
                    >
                      {getDayLabel(item.date, wm)}
                    </Text>
                  );
                })}
              </View>
            </>
          )}
        </View>

        <View
          style={{
            borderRadius: radii.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            padding: 18,
            gap: 12,
            ...iosCardShadow,
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Lịch sử tập luyện</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.cyan600} />
          ) : displayItems.length === 0 ? (
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate400, textAlign: "center", paddingVertical: 12 }}>
              Không có dữ liệu tập luyện
            </Text>
          ) : (
            displayItems.map((item, i) => {
              const formattedDate = new Date(item.date).toLocaleDateString("vi-VN", {
                weekday: "short",
                day: "numeric",
                month: "numeric",
              });
              return (
                <View
                  key={`${item.date}-row-${i}`}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: radii.cardMd,
                    backgroundColor: colors.slate100,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: colors.slate200,
                  }}
                >
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate800 }}>{formattedDate}</Text>
                    <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate500 }}>
                      {item.totalWorkoutMinutes} phút vận động
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="run" size={20} color={colors.cyan600} />
                </View>
              );
            })
          )}
        </View>
      </View>
    </OnboardingLayout>
  );
}
