import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors, touch } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import type { WorkoutPlayerPhase, WorkoutStackScreenProps } from "../navigation/workout-stack-types";
import { useWorkoutStore } from "../store/workout-store";

const BG: Record<WorkoutPlayerPhase, [string, string]> = {
  active: ["#0F172A", "#0B3D4A"],
  paused: ["#131A24", "#114054"],
  completed: ["#101826", "#0F3D54"],
};

export function WorkoutPlayerScreen({ navigation, route }: WorkoutStackScreenProps<"WorkoutPlayer">): ReactElement {
  const { exerciseId, exerciseName, sessionDate, phase: initialPhase } = route.params;

  type ExerciseId =
    | "barbell-squat"
    | "bench-press"
    | "deadlift"
    | "pull-up"
    | "overhead-press";

  const EXERCISE_MAP: Record<ExerciseId, number> = {
    "barbell-squat": 1,
    "bench-press": 2,
    deadlift: 3,
    "pull-up": 4,
    "overhead-press": 5,
  };

  const numericExerciseId =
    typeof exerciseId === "number"
      ? exerciseId
      : EXERCISE_MAP[exerciseId as ExerciseId] ?? 1;

  const [phase, setPhase] = useState<WorkoutPlayerPhase>(initialPhase ?? "active");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("0");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSetTimeRef = useRef(0);

  const startSession = useWorkoutStore((s) => s.startSession);
  const logSet = useWorkoutStore((s) => s.logSet);
  const finishSession = useWorkoutStore((s) => s.finishSession);
  const resetSession = useWorkoutStore((s) => s.resetSession);
  const activeSession = useWorkoutStore((s) => s.activeSession);
  const sessionCompleted = useWorkoutStore((s) => s.sessionCompleted);
  const totalDurationSec = useWorkoutStore((s) => s.totalDurationSec);

  // Khởi tạo session khi mount
  useEffect(() => {
    void startSession(numericExerciseId, exerciseName, sessionDate);
    timerRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Khi hoàn thành
  useEffect(() => {
    if (sessionCompleted) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase("completed");
    }
  }, [sessionCompleted]);

  const formatTime = (sec: number): string => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const setsLogged = activeSession?.sets.length ?? 0;
  const durationMin = Math.round(totalDurationSec / 60);
  // Ước tính Calo đốt: MET 5.0 * 3.5 * 70kg / 200 * phút (fallback)
  const kcalEstimate = Math.round((durationMin * 5.0 * 3.5 * 70) / 200);

  const handleLogSet = async (): Promise<void> => {
    const actualReps = parseInt(reps, 10) || 0;
    const actualWeightKg = parseFloat(weight) || 0;
    const currentDuration = elapsedSec - lastSetTimeRef.current;
    
    await logSet({
      exerciseId: numericExerciseId,
      actualReps,
      actualWeightKg,
      actualDurationSec: currentDuration > 0 ? currentDuration : null,
    });
    lastSetTimeRef.current = elapsedSec;
    Alert.alert("✅ Set logged", `${actualReps} reps @ ${actualWeightKg}kg`);
  };

  const handleFinish = async (): Promise<void> => {
    setPhase("completed");
    await finishSession();
  };

  const handleDone = (): void => {
    resetSession();
    navigation.popToTop();
  };

  return (
    <LinearGradient colors={BG[phase]} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right", "bottom"]}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 4 }}>
          {/* Topbar */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ width: touch.min, height: touch.min, alignItems: "center", justifyContent: "center" }}>
              <MaterialCommunityIcons name="chevron-left" size={26} color="#F8FAFC" />
            </Pressable>
            <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: "#F8FAFC" }}>Workout Session</Text>
            <View style={{ width: touch.min }} />
          </View>

          {/* ── ACTIVE ── */}
          {phase === "active" && (
            <View style={{ flex: 1, marginTop: 20, alignItems: "center" }}>
              {/* Timer */}
              <Text style={{ fontFamily: font.extrabold, fontSize: 64, letterSpacing: -2, color: colors.white }}>
                {formatTime(elapsedSec)}
              </Text>
              <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#86EFAC", marginTop: 6 }}>
                Active · Set {setsLogged + 1}
              </Text>

              {/* Exercise name */}
              <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.white, textAlign: "center", marginTop: 20, maxWidth: 320 }}>
                {exerciseName}
              </Text>

              {setsLogged > 0 && (
                <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#CBD5E1", marginTop: 6 }}>
                  {setsLogged} set{setsLogged > 1 ? "s" : ""} logged
                </Text>
              )}

              <View style={{ flex: 1 }} />

              {/* Set Logger */}
              <View style={{ width: "100%", borderRadius: 16, backgroundColor: "rgba(255,255,255,0.1)", padding: 16, gap: 12, marginBottom: 16 }}>
                <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: "#9CA3AF" }}>LOG THIS SET</Text>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontFamily: font.semibold, fontSize: 11, color: "#9CA3AF" }}>Reps</Text>
                    <TextInput
                      value={reps}
                      onChangeText={setReps}
                      keyboardType="numeric"
                      style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.white, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.3)", paddingVertical: 4 }}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontFamily: font.semibold, fontSize: 11, color: "#9CA3AF" }}>Weight (kg)</Text>
                    <TextInput
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                      style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.white, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.3)", paddingVertical: 4 }}
                    />
                  </View>
                </View>
                <Pressable
                  onPress={() => void handleLogSet()}
                  style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1, borderRadius: 12, backgroundColor: "#10B981", paddingVertical: 12, alignItems: "center" })}
                >
                  <Text style={{ fontFamily: font.extrabold, fontSize: 14, color: colors.white }}>+ Log Set</Text>
                </Pressable>
              </View>

              {/* Finish button */}
              <Pressable
                onPress={() => void handleFinish()}
                style={{ marginBottom: 12, borderRadius: 22, backgroundColor: "#052E16", paddingVertical: 14, width: "100%", alignItems: "center" }}
              >
                <Text style={{ fontFamily: font.bold, fontSize: 14, color: "#F8FAFC" }}>Finish Workout</Text>
              </Pressable>
            </View>
          )}

          {/* ── PAUSED ── */}
          {phase === "paused" && (
            <View style={{ flex: 1, marginTop: 20, alignItems: "center" }}>
              <Text style={{ fontFamily: font.extrabold, fontSize: 68, letterSpacing: -2.2, color: "#FDE68A" }}>
                {formatTime(elapsedSec)}
              </Text>
              <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: "#F59E0B", marginTop: 6 }}>Paused</Text>
              <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.white, textAlign: "center", marginTop: 20 }}>{exerciseName}</Text>
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={() => setPhase("active")}
                style={{ marginBottom: 12, borderRadius: 22, backgroundColor: "#78350F", paddingVertical: 14, width: "100%", alignItems: "center" }}
              >
                <MaterialCommunityIcons name="play" size={28} color="#F8FAFC" />
              </Pressable>
              <Pressable onPress={() => void handleFinish()}>
                <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>End session</Text>
              </Pressable>
            </View>
          )}

          {/* ── COMPLETED ── */}
          {phase === "completed" && (
            <View style={{ flex: 1, marginTop: 24, alignItems: "center" }}>
              <Text style={{ fontFamily: font.extrabold, fontSize: 32, letterSpacing: -0.8, color: colors.white }}>Great job! 🎉</Text>
              <Text style={{ fontFamily: font.bold, fontSize: 13, color: "#A7F3D0", marginTop: 8, textAlign: "center" }}>
                Session saved to your history!
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginTop: 28, width: "100%", justifyContent: "center" }}>
                <StatPill label="Sets" value={String(setsLogged)} />
                <StatPill label="Duration" value={`${durationMin} min`} />
                <StatPill label="~Calories" value={`${kcalEstimate} kcal`} />
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12, width: "100%" }}>
                <Pressable
                  onPress={handleDone}
                  style={{ flex: 1, borderRadius: 14, backgroundColor: "#E5E7EB", paddingVertical: 14, alignItems: "center" }}
                >
                  <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>Back to List</Text>
                </Pressable>
                <Pressable
                  onPress={handleDone}
                  style={{ flex: 1, borderRadius: 14, backgroundColor: colors.emerald600, paddingVertical: 14, alignItems: "center" }}
                >
                  <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.white }}>Done</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function StatPill(props: { label: string; value: string }): ReactElement {
  return (
    <View style={{ alignItems: "center", minWidth: 88 }}>
      <Text style={{ fontFamily: font.bold, fontSize: 11, color: "#9CA3AF" }}>{props.label}</Text>
      <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: colors.white, marginTop: 4 }}>{props.value}</Text>
    </View>
  );
}
