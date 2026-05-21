import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState, useEffect, type ReactElement } from "react";
import { ActivityIndicator, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { GradientPrimaryButton } from "../../module01/components/gradient-primary-button";
import { colors, iosCardShadow, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { DailyProgressItem, WeightPoint } from "../store/progress-dashboard-store";

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type WeekMonth = "week" | "month";

// ─────────────────────────────────────────────────────────────────────────────
// Header & Toggle
// ─────────────────────────────────────────────────────────────────────────────

export function ProgressDashboardHeader(props: {
  weekMonth: WeekMonth;
  onWeekMonthChange: (v: WeekMonth) => void;
}): ReactElement {
  const { weekMonth, onWeekMonthChange } = props;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <Text style={{ fontFamily: font.extrabold, fontSize: 30, letterSpacing: -0.8, color: "#0B1A33" }}>Progress</Text>
      <ProgressWeekMonthSegment value={weekMonth} onChange={onWeekMonthChange} />
    </View>
  );
}

export function ProgressWeekMonthSegment(props: {
  value: WeekMonth;
  onChange: (v: WeekMonth) => void;
}): ReactElement {
  const { value, onChange } = props;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.slate200,
        borderRadius: radii.pill,
        padding: 4,
        gap: 6,
      }}
    >
      {(["week", "month"] as const).map((v) => (
        <Pressable
          key={v}
          onPress={() => onChange(v)}
          accessibilityRole="button"
          accessibilityState={{ selected: value === v }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.9 : 1,
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 10,
            backgroundColor: value === v ? colors.white : "transparent",
            borderWidth: value === v ? StyleSheet.hairlineWidth : 0,
            borderColor: colors.slate200,
          })}
        >
          <Text style={{ fontFamily: value === v ? font.bold : font.semibold, fontSize: 12, color: value === v ? colors.slate700 : colors.slate500 }}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart Grid helper (horizontal lines)
// ─────────────────────────────────────────────────────────────────────────────

function ChartGrid(props: { height: number; lines?: number }): ReactElement {
  const { height, lines = 3 } = props;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: lines }, (_, i) => (
        <View
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: (height / (lines + 1)) * (i + 1),
            height: StyleSheet.hairlineWidth,
            backgroundColor: colors.slate200,
          }}
        />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Line chart for Weight Trend
// ─────────────────────────────────────────────────────────────────────────────

function LineSegments(props: { chartW: number; chartH: number; values: number[] }): ReactElement | null {
  const { chartW, chartH, values } = props;
  if (chartW <= 0 || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padY = 14;
  const usableH = chartH - padY * 2;
  const n = values.length;
  const xs = values.map((_, i) => (n === 1 ? chartW / 2 : (i / (n - 1)) * (chartW - 32) + 16));
  const ys = values.map((v) => padY + ((max - v) / (max - min || 1)) * usableH);
  const segments: ReactElement[] = [];
  for (let i = 0; i < n - 1; i++) {
    const x1 = xs[i] ?? 0, y1 = ys[i] ?? 0, x2 = xs[i + 1] ?? 0, y2 = ys[i + 1] ?? 0;
    const dx = x2 - x1, dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    segments.push(
      <LinearGradient
        key={`seg-${i}`}
        colors={["#10B981", "#0EA5E9"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: "absolute",
          left: (x1 + x2) / 2 - length / 2,
          top: (y1 + y2) / 2 - 1.5,
          width: length,
          height: 3,
          borderRadius: 2,
          transform: [{ rotate: `${angle}rad` }],
        }}
      />,
    );
  }
  const lastX = xs[n - 1] ?? 0;
  const lastY = ys[n - 1] ?? 0;
  const lastVal = values[n - 1] ?? 0;
  return (
    <>
      {segments}
      <View style={{ position: "absolute", left: lastX - 8, top: lastY - 8, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.white, borderWidth: 3, borderColor: colors.cyan600 }} />
      <View style={{ position: "absolute", right: 8, top: 12, backgroundColor: colors.slate900, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 10 }}>
        <Text style={{ fontFamily: font.bold, fontSize: 10, color: colors.white }}>{lastVal.toFixed(1)} kg</Text>
      </View>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BIỂU ĐỒ CÂN NẶNG — Weight Trend (Line chart)
// ─────────────────────────────────────────────────────────────────────────────

export function WeightTrendCard(props: {
  series?: WeightPoint[];
  onPress?: () => void;
  chartHeight?: number;
}): ReactElement {
  const { series = [], chartHeight = 168 } = props;
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent): void => setW(e.nativeEvent.layout.width);
  const values = series.map((p) => p.weightKg);
  const labels = series.map((p) => {
    const d = new Date(p.date);
    return DAYS_SHORT[d.getUTCDay() === 0 ? 6 : d.getUTCDay() - 1] ?? "--";
  });

  const cardStyle = {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: 18,
    gap: 10,
    ...iosCardShadow,
  } as const;

  const isEmpty = values.length === 0;

  const body = (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>Weight Trend</Text>
        <MaterialCommunityIcons name="scale" size={18} color={colors.cyan600} />
      </View>
      {isEmpty ? (
        <View style={{ height: chartHeight, alignItems: "center", justifyContent: "center", gap: 6 }}>
          <MaterialCommunityIcons name="scale-balance" size={32} color={colors.slate300} />
          <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate400 }}>No weight logs yet</Text>
        </View>
      ) : (
        <>
          <View style={{ height: chartHeight, borderRadius: 12, backgroundColor: colors.slate100, overflow: "hidden" }} onLayout={onLayout}>
            <ChartGrid height={chartHeight} />
            <LineSegments chartW={w} chartH={chartHeight} values={values} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {labels.map((d, i) => (
              <Text key={i} style={{ fontFamily: font.regular, fontSize: 10, color: colors.slate400 }}>{d}</Text>
            ))}
          </View>
        </>
      )}
    </>
  );

  if (props.onPress) {
    return (
      <Pressable onPress={props.onPress} accessibilityRole="button" accessibilityLabel="Weight trend, tap for details" style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.92 : 1 }]}>
        {body}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{body}</View>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BIỂU ĐỒ CALO — Calories In vs Out (Grouped Bar chart) — BIỂU ĐỒ CHÍNH
// ─────────────────────────────────────────────────────────────────────────────

export function CaloriesWeekCard(props: {
  items?: DailyProgressItem[];
  onPress?: () => void;
}): ReactElement {
  const { items = [] } = props;
  const kcalInData = items.map((d) => d.totalKcalIn);
  const kcalOutData = items.map((d) => d.totalKcalOut);
  const labels = items.map((d) => {
    const date = new Date(d.date);
    return DAYS_SHORT[date.getUTCDay() === 0 ? 6 : date.getUTCDay() - 1] ?? "--";
  });
  const maxVal = Math.max(...kcalInData, ...kcalOutData, 1);
  const BAR_MAX_H = 100;

  const cardStyle = {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: 18,
    gap: 12,
    ...iosCardShadow,
  } as const;

  const isEmpty = items.length === 0 || kcalInData.every((v) => v === 0);

  const inner = (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>Calories Overview</Text>
        <MaterialCommunityIcons name="fire" size={18} color="#F97316" />
      </View>
      {/* Legend */}
      <View style={{ flexDirection: "row", gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: "#10B981" }} />
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate500 }}>Nạp vào</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: "#F97316" }} />
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate500 }}>Đốt cháy</Text>
        </View>
      </View>

      {isEmpty ? (
        <View style={{ height: 140, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.slate100, borderRadius: 12 }}>
          <MaterialCommunityIcons name="chart-bar" size={32} color={colors.slate300} />
          <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate400 }}>No calorie data yet</Text>
        </View>
      ) : (
        <>
          <View style={{ height: 140, backgroundColor: colors.slate100, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
            {items.map((item, i) => {
              const inH = Math.max(4, (kcalInData[i]! / maxVal) * BAR_MAX_H);
              const outH = Math.max(4, (kcalOutData[i]! / maxVal) * BAR_MAX_H);
              return (
                <View key={i} style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 2, height: "100%" }}>
                  {/* Calo IN */}
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={{ flex: 1, height: inH, borderRadius: 4 }}
                  />
                  {/* Calo OUT */}
                  <LinearGradient
                    colors={["#FB923C", "#F97316"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={{ flex: 1, height: outH, borderRadius: 4 }}
                  />
                </View>
              );
            })}
          </View>
          {/* X-axis labels */}
          <View style={{ flexDirection: "row" }}>
            {labels.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontFamily: font.regular, fontSize: 10, color: colors.slate400 }}>{d}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );

  if (props.onPress) {
    return (
      <Pressable onPress={props.onPress} accessibilityRole="button" accessibilityLabel="Calories chart, tap for details" style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.92 : 1 }]}>
        {inner}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{inner}</View>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BIỂU ĐỒ THỜI GIAN TẬP — Workout Minutes (Bar chart)
// ─────────────────────────────────────────────────────────────────────────────

export function WorkoutMinutesCard(props: {
  items?: DailyProgressItem[];
  onPress?: () => void;
}): ReactElement {
  const { items = [] } = props;
  const minutesData = items.map((d) => d.totalWorkoutMinutes);
  const labels = items.map((d) => {
    const date = new Date(d.date);
    return DAYS_SHORT[date.getUTCDay() === 0 ? 6 : date.getUTCDay() - 1] ?? "--";
  });
  const maxVal = Math.max(...minutesData, 1);
  const BAR_MAX_H = 90;
  const isEmpty = minutesData.every((v) => v === 0);

  const cardStyle = {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: 18,
    gap: 10,
    ...iosCardShadow,
  } as const;

  const inner = (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>Workout Time</Text>
        <MaterialCommunityIcons name="clock-outline" size={18} color={colors.cyan600} />
      </View>

      {isEmpty ? (
        <View style={{ height: 120, alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.slate100, borderRadius: 12 }}>
          <MaterialCommunityIcons name="run" size={32} color={colors.slate300} />
          <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate400 }}>No workouts logged yet</Text>
        </View>
      ) : (
        <>
          <View style={{ height: 120, backgroundColor: colors.slate100, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
            {minutesData.map((mins, i) => {
              const bh = Math.max(4, (mins / maxVal) * BAR_MAX_H);
              return (
                <View key={i} style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <LinearGradient
                    colors={["#22D3EE", "#0EA5E9"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={{ width: "100%", height: bh, borderRadius: 5 }}
                  />
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: "row" }}>
            {labels.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontFamily: font.regular, fontSize: 10, color: colors.slate400 }}>{d}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </>
  );

  if (props.onPress) {
    return (
      <Pressable onPress={props.onPress} accessibilityRole="button" accessibilityLabel="Workout time chart, tap for details" style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.92 : 1 }]}>
        {inner}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{inner}</View>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary Stat Row (dữ liệu thực từ API)
// ─────────────────────────────────────────────────────────────────────────────

export function SummaryStatRow(props: {
  currentKg?: number | null;
  changeKg?: number | null;
  avgKcal?: number;
  muted?: boolean;
}): ReactElement {
  const { currentKg, changeKg, avgKcal, muted } = props;
  const changeSign = (changeKg ?? 0) > 0 ? "+" : "";
  const changeColor = (changeKg ?? 0) <= 0 ? colors.emerald600 : "#EF4444";

  const stat = (label: string, value: string, valueColor?: string) => (
    <View style={{ flex: 1, borderRadius: radii.btn, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.slate200, backgroundColor: colors.white, paddingVertical: 12, paddingHorizontal: 10, gap: 6 }}>
      <Text style={{ fontFamily: font.bold, fontSize: 10, color: colors.slate500 }}>{label}</Text>
      <Text style={{ fontFamily: font.extrabold, fontSize: 18, color: valueColor ?? colors.slate900 }}>{value}</Text>
    </View>
  );

  return (
    <View style={{ flexDirection: "row", gap: 10, opacity: muted ? 0.55 : 1 }}>
      {stat("Current", currentKg != null ? `${currentKg.toFixed(1)} kg` : "--")}
      {stat("Change", changeKg != null ? `${changeSign}${changeKg.toFixed(1)} kg` : "--", changeColor)}
      {stat("Avg cal", avgKcal != null ? avgKcal.toLocaleString() : "--")}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading / Empty / Partial States
// ─────────────────────────────────────────────────────────────────────────────

export function ProgressDashboardLoading(): ReactElement {
  return (
    <View style={{ width: "100%", gap: 14, flex: 1, alignItems: "center", paddingTop: 24 }}>
      <ActivityIndicator color={colors.cyan600} />
      <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>Loading analytics…</Text>
      <View style={{ width: "100%", gap: 12, marginTop: 8 }}>
        <View style={{ height: 180, borderRadius: radii.card, backgroundColor: colors.slate200, opacity: 0.5 }} />
        <View style={{ height: 140, borderRadius: radii.card, backgroundColor: colors.slate200, opacity: 0.45 }} />
        <View style={{ height: 120, borderRadius: radii.card, backgroundColor: colors.slate200, opacity: 0.4 }} />
      </View>
    </View>
  );
}

export function ProgressDashboardEmpty(props: { onAddFirstLog: () => void }): ReactElement {
  return (
    <View style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center", gap: 14, paddingVertical: 32 }}>
      <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: "#ECFEFF", alignItems: "center", justifyContent: "center" }}>
        <MaterialCommunityIcons name="chart-line-variant" size={42} color={colors.cyan600} />
      </View>
      <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.slate900 }}>No progress data yet</Text>
      <Text style={{ fontFamily: font.semibold, fontSize: 13, lineHeight: 20, color: colors.slate500, textAlign: "center", maxWidth: 280 }}>
        Add your first weight entry or log a meal to start seeing trends.
      </Text>
      <GradientPrimaryButton label="Add first log" onPress={props.onAddFirstLog} height={48} />
    </View>
  );
}

export function ProgressDashboardPartial(props: {
  summary?: import("../store/progress-dashboard-store").ProgressSummary | null;
}): ReactElement {
  const { summary } = props;
  return (
    <View style={{ width: "100%", gap: 16, flex: 1, opacity: 0.92 }}>
      <CaloriesWeekCard items={summary?.dailyItems} />
      <WeightTrendCard series={summary?.weight.series} />
      <WorkoutMinutesCard items={summary?.dailyItems} />
      <SummaryStatRow
        currentKg={summary?.weight.currentKg}
        changeKg={summary?.weight.changeKg}
        avgKcal={summary?.averages.avgKcalIn}
        muted
      />
    </View>
  );
}

// Legacy export compatibility
export const DEMO_WEIGHT_KG = [70.4, 70.5, 70.65, 70.85, 70.95, 71.05, 71.2];
export const DEMO_CAL_BAR_H = [42, 68, 58, 74, 64, 84, 56];
export const DEMO_CAL_COLORS = ["#BFDBFE", "#7DD3FC", "#5EEAD4", "#22D3EE", "#38BDF8", "#10B981", "#93C5FD"] as const;
