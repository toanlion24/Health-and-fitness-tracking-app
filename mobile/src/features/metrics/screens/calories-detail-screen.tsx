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

export function CaloriesDetailScreen(_props: ProgressStackScreenProps<"CaloriesDetail">): ReactElement {
  const [wm, setWm] = useState<"week" | "month">("week");
  
  const { summary, fetchSummary, phase } = useProgressDashboardStore();

  useEffect(() => {
    void fetchSummary(wm);
  }, [wm]);

  const items = summary?.dailyItems ?? [];
  const consumedVals = items.map((d) => d.totalKcalIn);
  const burnedVals = items.map((d) => d.totalKcalOut);
  const maxH = Math.max(100, ...consumedVals, ...burnedVals);
  const isLoading = phase === "loading";

  // Reversely sort for the list to display latest date first
  const displayItems = [...items].reverse();

  return (
    <OnboardingLayout variant="metricsDash" contentInset={layout.contentPadProgressDetail} scrollable>
      <View style={{ width: "100%", gap: 18, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 26, color: colors.slate900 }}>Calo</Text>
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
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Calo hấp thụ vs đốt cháy</Text>
          
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
                  <View
                    key={`${item.date}-${i}`}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "flex-end",
                      gap: wm === "month" ? 1 : 3,
                      height: "100%",
                    }}
                  >
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                      <LinearGradient
                        colors={["#0EA5E9", "#0284C7"]}
                        style={{
                          width: "100%",
                          height: Math.max(4, (item.totalKcalIn / maxH) * 130),
                          borderRadius: 3,
                          opacity: 0.95,
                        }}
                      />
                    </View>
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                      <LinearGradient
                        colors={["#E11D48", "#BE123C"]}
                        style={{
                          width: "100%",
                          height: Math.max(3, (item.totalKcalOut / maxH) * 130),
                          borderRadius: 3,
                          opacity: 0.95,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 2 }}>
                {items.map((item, i) => {
                  // Only show limited dates if on month layout to keep clean
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

          <View style={{ flexDirection: "row", gap: 16, paddingTop: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cyan600 }} />
              <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate600 }}>Nạp vào</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#E11D48" }} />
              <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate600 }}>Đốt cháy</Text>
            </View>
          </View>
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
          <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>Nhật ký hàng ngày</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.cyan600} />
          ) : displayItems.length === 0 ? (
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate400, textAlign: "center", paddingVertical: 12 }}>
              Không có dữ liệu
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
                      Nạp: {item.totalKcalIn.toLocaleString()} kcal | Tiêu: {item.totalKcalOut.toLocaleString()} kcal
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="circle-double" size={18} color={item.totalKcalIn > item.totalKcalOut ? colors.cyan600 : "#E11D48"} />
                </View>
              );
            })
          )}
        </View>
      </View>
    </OnboardingLayout>
  );
}
