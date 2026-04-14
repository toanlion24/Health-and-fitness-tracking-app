import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { ExerciseDto, WorkoutSessionDetailDto } from "@health-fitness/shared";
import type { AppStackParamList } from "../../../core/navigation/types";
import { appTheme } from "../../../core/theme/app-theme";
import { ScreenScroll } from "../../../core/ui/screen-scaffold";
import { ErrorState } from "../../../core/ui-states/error-state";
import { LoadingState } from "../../../core/ui-states/loading-state";
import { ApiClientError } from "../../../core/api/api-error";
import { isApiErrorBody } from "../../../core/api/client";
import {
  addWorkoutSet,
  completeWorkoutSession,
  fetchExercises,
  fetchWorkoutSession,
} from "../services/workouts-api";

type Props = StackScreenProps<AppStackParamList, "WorkoutSession">;

export function WorkoutSessionScreen({ route, navigation }: Props) {
  const sessionId = Number(route.params.sessionId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<WorkoutSessionDetailDto | null>(null);
  const [exercises, setExercises] = useState<ExerciseDto[]>([]);
  const [busy, setBusy] = useState(false);
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("20");

  const load = useCallback(async () => {
    if (!Number.isInteger(sessionId) || sessionId < 1) {
      setError("Phiên không hợp lệ");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [s, ex] = await Promise.all([
        fetchWorkoutSession(sessionId),
        fetchExercises(),
      ]);
      setSession(s);
      setExercises(ex);
    } catch (e) {
      const msg =
        e instanceof ApiClientError && isApiErrorBody(e.body)
          ? e.body.message
          : "Không tải được phiên";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const nextSetIndex = (s: WorkoutSessionDetailDto): number => {
    if (s.sets.length === 0) {
      return 1;
    }
    return Math.max(...s.sets.map((x) => x.setIndex)) + 1;
  };

  const parsePositive = (raw: string, fallback: number): number => {
    const n = Number(raw.replace(",", "."));
    if (!Number.isFinite(n) || n < 0) {
      return fallback;
    }
    return n;
  };

  const addSetForExercise = async (exerciseId: number) => {
    if (!session || session.status !== "in_progress") {
      return;
    }
    const r = parsePositive(reps, 10);
    const w = parsePositive(weight, 20);
    setBusy(true);
    setError(null);
    try {
      const updated = await addWorkoutSet(sessionId, {
        exerciseId,
        setIndex: nextSetIndex(session),
        actualReps: r,
        actualWeightKg: w,
      });
      setSession(updated);
    } catch (e) {
      const msg =
        e instanceof ApiClientError && isApiErrorBody(e.body)
          ? e.body.message
          : "Không thêm được set";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      await completeWorkoutSession(sessionId);
      navigation.navigate("Workouts");
    } catch (e) {
      const msg =
        e instanceof ApiClientError && isApiErrorBody(e.body)
          ? e.body.message
          : "Không kết thúc được";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải phiên…" />;
  }

  if (error && !session) {
    return (
      <ErrorState
        title="Lỗi phiên"
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  if (!session) {
    return null;
  }

  const canEdit = session.status === "in_progress";
  const statusLabel =
    session.status === "completed" ? "Hoàn thành" : "Đang tập";

  return (
    <ScreenScroll>
      {error ? <Text style={styles.banner}>{error}</Text> : null}
      <View style={styles.header}>
        <Text style={styles.title}>Phiên #{session.id}</Text>
        <Text style={styles.meta}>
          {session.sessionDate} · {statusLabel}
        </Text>
      </View>

      <Text style={styles.section}>Các set đã ghi</Text>
      {session.sets.length === 0 ? (
        <Text style={styles.hint}>
          Chọn số rep / kg ở dưới, rồi chạm tên bài để thêm set.
        </Text>
      ) : (
        session.sets.map((st) => (
          <View key={st.id} style={styles.setCard}>
            <Text style={styles.setText}>
              Set #{st.setIndex} · {st.exercise.name}
            </Text>
            <Text style={styles.setDetail}>
              {st.actualReps ?? "—"} reps × {st.actualWeightKg ?? "—"} kg
            </Text>
          </View>
        ))
      )}

      {canEdit ? (
        <>
          <Text style={styles.section}>Mặc định cho set tiếp theo</Text>
          <View style={styles.rowInputs}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                value={reps}
                onChangeText={setReps}
                keyboardType="number-pad"
                style={styles.input}
                placeholder="10"
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Kg</Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="20"
              />
            </View>
          </View>

          <Text style={styles.section}>Chọn bài để thêm set</Text>
          <View style={styles.chips}>
            {exercises.map((ex) => (
              <Pressable
                key={ex.id}
                style={({ pressed }) => [
                  styles.chip,
                  (busy || pressed) && styles.chipPressed,
                ]}
                onPress={() => void addSetForExercise(ex.id)}
                disabled={busy}
              >
                <Text style={styles.chipText}>{ex.name}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.done,
              (busy || pressed) && styles.donePressed,
            ]}
            onPress={() => void finish()}
            disabled={busy}
          >
            <Text style={styles.doneText}>
              {busy ? "Đang lưu…" : "Hoàn thành buổi tập"}
            </Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.doneBadge}>
          <Text style={styles.doneBadgeText}>Buổi tập đã hoàn thành.</Text>
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  banner: {
    color: appTheme.colors.danger,
    marginBottom: appTheme.space.sm,
    fontSize: 14,
  },
  header: {
    backgroundColor: appTheme.colors.surface,
    padding: appTheme.space.md,
    borderRadius: appTheme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    marginBottom: appTheme.space.md,
    ...appTheme.shadow.card,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: appTheme.colors.text,
  },
  meta: {
    marginTop: 6,
    fontSize: 14,
    color: appTheme.colors.textMuted,
  },
  section: {
    marginTop: appTheme.space.md,
    fontSize: 15,
    fontWeight: "800",
    color: appTheme.colors.text,
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    color: appTheme.colors.textMuted,
    lineHeight: 20,
  },
  setCard: {
    backgroundColor: appTheme.colors.surface,
    padding: 12,
    borderRadius: appTheme.radius.md,
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
  },
  setText: { fontWeight: "700", color: appTheme.colors.text, fontSize: 15 },
  setDetail: {
    marginTop: 4,
    fontSize: 14,
    color: appTheme.colors.textMuted,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  inputCol: { flex: 1 },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: appTheme.colors.textMuted,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    borderRadius: appTheme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: appTheme.colors.surface,
    color: appTheme.colors.text,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  chip: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipPressed: { opacity: 0.85 },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: appTheme.colors.primaryPressed,
  },
  done: {
    marginTop: appTheme.space.lg,
    backgroundColor: appTheme.colors.primary,
    padding: 14,
    borderRadius: appTheme.radius.md,
  },
  donePressed: { opacity: 0.92 },
  doneText: {
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 16,
  },
  doneBadge: {
    marginTop: appTheme.space.md,
    padding: 12,
    backgroundColor: "#dcfce7",
    borderRadius: appTheme.radius.md,
  },
  doneBadgeText: {
    color: appTheme.colors.success,
    fontWeight: "700",
    textAlign: "center",
  },
});
