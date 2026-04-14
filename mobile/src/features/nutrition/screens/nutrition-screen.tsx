import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { FoodDto, MealLogDto } from "@health-fitness/shared";
import type { AppStackParamList } from "../../../core/navigation/types";
import {
  addCalendarDaysUtc,
  formatUtcDateLabel,
  todayUtcDateString,
} from "../../../core/date/calendar-utc";
import { appTheme } from "../../../core/theme/app-theme";
import { ScreenScroll } from "../../../core/ui/screen-scaffold";
import { ErrorState } from "../../../core/ui-states/error-state";
import { LoadingState } from "../../../core/ui-states/loading-state";
import { EmptyState } from "../../../core/ui-states/empty-state";
import { ApiClientError } from "../../../core/api/api-error";
import { isApiErrorBody } from "../../../core/api/client";
import {
  addMealItem,
  createMealLog,
  fetchFoods,
  fetchMealLogsForDate,
} from "../services/nutrition-api";

type Props = StackScreenProps<AppStackParamList, "Nutrition">;

const MEAL_LABEL: Record<string, string> = {
  breakfast: "Sáng",
  lunch: "Trưa",
  dinner: "Tối",
  snack: "Phụ",
};

export function NutritionScreen({ route }: Props) {
  const [day, setDay] = useState(route.params?.date ?? todayUtcDateString());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meals, setMeals] = useState<MealLogDto[]>([]);
  const [foods, setFoods] = useState<FoodDto[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (route.params?.date) {
      setDay(route.params.date);
    }
  }, [route.params?.date]);

  const isoNow = useMemo(() => new Date().toISOString(), [day]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [m, f] = await Promise.all([
        fetchMealLogsForDate(day),
        fetchFoods(),
      ]);
      setMeals(m);
      setFoods(f);
    } catch (e) {
      const msg =
        e instanceof ApiClientError && isApiErrorBody(e.body)
          ? e.body.message
          : "Không tải được dữ liệu";
      setError(msg);
    }
  }, [day]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const shiftDay = (delta: number) => {
    setDay((d) => addCalendarDaysUtc(d, delta));
  };

  const addBreakfast = async () => {
    setBusy(true);
    setError(null);
    try {
      await createMealLog({
        mealType: "breakfast",
        loggedAt: isoNow,
      });
      await load();
    } catch (e) {
      const msg =
        e instanceof ApiClientError && isApiErrorBody(e.body)
          ? e.body.message
          : "Không tạo được bữa";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const attachFood = async (mealId: number, food: FoodDto) => {
    setBusy(true);
    setError(null);
    try {
      await addMealItem(mealId, { foodId: food.id, quantity: 1 });
      await load();
    } catch (e) {
      const msg =
        e instanceof ApiClientError && isApiErrorBody(e.body)
          ? e.body.message
          : "Không thêm được món";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải…" />;
  }

  if (error && meals.length === 0 && foods.length === 0) {
    return (
      <ErrorState
        title="Không tải được"
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={onRefresh}>
      {error ? <Text style={styles.banner}>{error}</Text> : null}

      <View style={styles.dateBar}>
        <Pressable
          onPress={() => shiftDay(-1)}
          style={({ pressed }) => [styles.dateBtn, pressed && styles.pressed]}
        >
          <Text style={styles.dateBtnText}>←</Text>
        </Pressable>
        <View style={styles.dateCenter}>
          <Text style={styles.dateTitle}>{formatUtcDateLabel(day)}</Text>
          <Text style={styles.dateIso}>{day} (UTC)</Text>
        </View>
        <Pressable
          onPress={() => shiftDay(1)}
          style={({ pressed }) => [styles.dateBtn, pressed && styles.pressed]}
        >
          <Text style={styles.dateBtnText}>→</Text>
        </Pressable>
      </View>

      <Text style={styles.intro}>
        Ghi nhận bữa ăn trong ngày. Thêm bữa, rồi chạm món trong danh mục để
        thêm vào bữa trống.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.primaryBtn,
          (busy || pressed) && styles.pressed,
        ]}
        onPress={() => void addBreakfast()}
        disabled={busy}
      >
        <Text style={styles.primaryBtnText}>+ Thêm bữa sáng</Text>
      </Pressable>

      {meals.length === 0 ? (
        <EmptyState
          title="Chưa có bữa"
          description="Thêm bữa sáng hoặc các bữa khác (qua API nếu cần)."
        />
      ) : (
        meals.map((m) => (
          <View key={m.id} style={styles.mealCard}>
            <Text style={styles.mealTitle}>
              {MEAL_LABEL[m.mealType] ?? m.mealType} ·{" "}
              {new Date(m.loggedAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {m.items.length === 0 ? (
              <View style={styles.foodPick}>
                <Text style={styles.foodPickLabel}>Chọn món (1 khẩu phần)</Text>
                {foods.length === 0 ? (
                  <Text style={styles.muted}>Danh mục trống trên server.</Text>
                ) : (
                  foods.map((f) => (
                    <Pressable
                      key={f.id}
                      style={({ pressed }) => [
                        styles.foodRow,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => void attachFood(m.id, f)}
                      disabled={busy}
                    >
                      <Text style={styles.foodRowName}>{f.name}</Text>
                      <Text style={styles.foodRowKcal}>
                        {f.kcalPerServing} kcal
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            ) : (
              m.items.map((it) => (
                <View key={it.id} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {it.customFoodName ?? `Món #${it.foodId}`}
                  </Text>
                  <Text style={styles.itemKcal}>{it.kcal} kcal</Text>
                </View>
              ))
            )}
          </View>
        ))
      )}

      <Text style={styles.section}>Danh mục tham khảo</Text>
      {foods.map((f) => (
        <Text key={f.id} style={styles.catalogLine}>
          · {f.name} — {f.kcalPerServing} kcal / {f.servingUnit ?? "khẩu phần"}
        </Text>
      ))}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  banner: {
    color: appTheme.colors.danger,
    marginBottom: appTheme.space.sm,
    fontSize: 14,
  },
  dateBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    padding: 8,
    marginBottom: appTheme.space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    ...appTheme.shadow.card,
  },
  dateBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: appTheme.radius.sm,
  },
  dateBtnText: { fontSize: 20, color: appTheme.colors.primary },
  dateCenter: { flex: 1, alignItems: "center" },
  dateTitle: { fontWeight: "800", fontSize: 16, color: appTheme.colors.text },
  dateIso: { fontSize: 12, color: appTheme.colors.textMuted, marginTop: 2 },
  intro: {
    fontSize: 14,
    color: appTheme.colors.textMuted,
    lineHeight: 20,
    marginBottom: appTheme.space.md,
  },
  primaryBtn: {
    alignSelf: "flex-start",
    backgroundColor: appTheme.colors.text,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: appTheme.radius.md,
    marginBottom: appTheme.space.md,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
  pressed: { opacity: 0.88 },
  mealCard: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.md,
    padding: appTheme.space.md,
    marginBottom: appTheme.space.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
  },
  mealTitle: {
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 8,
    color: appTheme.colors.text,
  },
  foodPick: { marginTop: 4 },
  foodPickLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: appTheme.colors.textMuted,
    marginBottom: 6,
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: appTheme.colors.border,
  },
  foodRowName: { flex: 1, fontSize: 14, color: appTheme.colors.text },
  foodRowKcal: {
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.primary,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  itemName: { fontSize: 14, color: appTheme.colors.text },
  itemKcal: { fontSize: 14, fontWeight: "700", color: appTheme.colors.text },
  muted: { fontSize: 13, color: appTheme.colors.textSoft },
  section: {
    marginTop: appTheme.space.lg,
    fontWeight: "800",
    fontSize: 15,
    color: appTheme.colors.text,
  },
  catalogLine: {
    marginTop: 6,
    fontSize: 13,
    color: appTheme.colors.textMuted,
  },
});
