import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { ExerciseDto, WorkoutPlanSummaryDto } from "@health-fitness/shared";
import type { AppStackParamList } from "../../../core/navigation/types";
import { todayUtcDateString } from "../../../core/date/calendar-utc";
import { appTheme } from "../../../core/theme/app-theme";
import { ScreenChrome } from "../../../core/ui/screen-scaffold";
import { ErrorState } from "../../../core/ui-states/error-state";
import { LoadingState } from "../../../core/ui-states/loading-state";
import { EmptyState } from "../../../core/ui-states/empty-state";
import { ApiClientError } from "../../../core/api/api-error";
import { isApiErrorBody } from "../../../core/api/client";
import {
  createWorkoutSession,
  fetchExercises,
  fetchWorkoutPlans,
} from "../services/workouts-api";

type Props = StackScreenProps<AppStackParamList, "Workouts">;

export function WorkoutsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [plans, setPlans] = useState<WorkoutPlanSummaryDto[]>([]);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [ex, pl] = await Promise.all([
        fetchExercises(),
        fetchWorkoutPlans(false),
      ]);
      setExercises(ex);
      setPlans(pl as WorkoutPlanSummaryDto[]);
    } catch (e) {
      const msg =
        e instanceof ApiClientError && isApiErrorBody(e.body)
          ? e.body.message
          : "Failed to load";
      setError(msg);
    }
  }, []);

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

  const startSession = async () => {
    setStarting(true);
    setError(null);
    try {
      const session = await createWorkoutSession({
        sessionDate: todayUtcDateString(),
        notes: null,
      });
      navigation.navigate("WorkoutSession", {
        sessionId: String(session.id),
      });
    } catch (e) {
      const msg =
        e instanceof ApiClientError && isApiErrorBody(e.body)
          ? e.body.message
          : "Could not start session";
      setError(msg);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải…" />;
  }

  if (error && exercises.length === 0) {
    return (
      <ErrorState
        title="Không tải được"
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <ScreenChrome>
      <FlatList
        data={exercises}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {error ? <Text style={styles.banner}>{error}</Text> : null}
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>Buổi tập hôm nay</Text>
              <Text style={styles.heroSub}>
                Bắt đầu phiên mới, ghi từng set, rồi hoàn thành khi xong.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.primary,
                  (starting || pressed) && styles.primaryPressed,
                ]}
                onPress={() => void startSession()}
                disabled={starting}
              >
                <Text style={styles.primaryText}>
                  {starting ? "Đang tạo…" : "Bắt đầu buổi tập (UTC hôm nay)"}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.section}>Danh mục bài tập</Text>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="Chưa có bài tập"
            description="Chạy migration + seed trên server."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowTitle}>{item.name}</Text>
            <Text style={styles.rowMeta}>
              {[item.muscleGroup, item.equipment].filter(Boolean).join(" · ") ||
                "—"}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <>
            <Text style={styles.section}>Kế hoạch của bạn ({plans.length})</Text>
            {plans.length === 0 ? (
              <Text style={styles.footerHint}>
                Chưa có plan. Có thể tạo qua API hoặc màn hình sau này.
              </Text>
            ) : (
              plans.map((p) => (
                <View key={p.id} style={styles.planPill}>
                  <Text style={styles.planText}>{p.name}</Text>
                </View>
              ))
            )}
          </>
        }
      />
    </ScreenChrome>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: appTheme.space.md,
    paddingBottom: appTheme.space.xl,
  },
  banner: {
    color: appTheme.colors.danger,
    marginBottom: appTheme.space.sm,
    fontSize: 14,
  },
  hero: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    padding: appTheme.space.md,
    marginBottom: appTheme.space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    ...appTheme.shadow.card,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: appTheme.colors.text,
  },
  heroSub: {
    marginTop: 6,
    fontSize: 14,
    color: appTheme.colors.textMuted,
    lineHeight: 20,
  },
  primary: {
    marginTop: appTheme.space.md,
    backgroundColor: appTheme.colors.primary,
    paddingVertical: 14,
    borderRadius: appTheme.radius.md,
  },
  primaryPressed: { opacity: 0.9 },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
  section: {
    fontSize: 15,
    fontWeight: "800",
    color: appTheme.colors.text,
    marginTop: appTheme.space.sm,
    marginBottom: appTheme.space.sm,
  },
  row: {
    backgroundColor: appTheme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: appTheme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
  },
  rowTitle: { fontSize: 16, fontWeight: "700", color: appTheme.colors.text },
  rowMeta: {
    fontSize: 13,
    color: appTheme.colors.textMuted,
    marginTop: 4,
  },
  footerHint: {
    fontSize: 14,
    color: appTheme.colors.textMuted,
    lineHeight: 20,
  },
  planPill: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 8,
  },
  planText: { fontWeight: "700", color: appTheme.colors.primaryPressed },
});
