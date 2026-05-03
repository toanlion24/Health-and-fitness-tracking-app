import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import { getExerciseById } from "../data/exercises";
import type { WorkoutPlayerPhase, WorkoutStackScreenProps } from "../navigation/workout-stack-types";

const BG: Record<WorkoutPlayerPhase, [string, string]> = {
  active: ["#0F172A", "#0B3D4A"],
  paused: ["#131A24", "#114054"],
  completed: ["#101826", "#0F3D54"],
};

export function WorkoutPlayerScreen({ navigation, route }: WorkoutStackScreenProps<"WorkoutPlayer">): ReactElement {
  const exercise = getExerciseById(route.params.exerciseId);
  const [phase, setPhase] = useState<WorkoutPlayerPhase>(route.params.phase ?? "active");

  if (exercise == null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.slate900 }}>
        <Text style={{ color: colors.white, padding: 20 }}>Missing exercise.</Text>
      </SafeAreaView>
    );
  }

  const onDone = (): void => {
    navigation.popToTop();
  };

  return (
    <LinearGradient colors={BG[phase]} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right", "bottom"]}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={8}
              style={{ width: touch.min, height: touch.min, alignItems: "center", justifyContent: "center" }}
            >
              <MaterialCommunityIcons name="chevron-left" size={26} color="#F8FAFC" />
            </Pressable>
            <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: "#F8FAFC" }}>Workout Player</Text>
            <Pressable
              hitSlop={8}
              style={{ width: touch.min, height: touch.min, alignItems: "center", justifyContent: "center" }}
            >
              <MaterialCommunityIcons name="dots-horizontal" size={20} color="#F8FAFC" />
            </Pressable>
          </View>

          {phase === "active" && (
            <View style={{ flex: 1, marginTop: 20, alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: font.extrabold,
                  fontSize: 64,
                  letterSpacing: -2,
                  color: colors.white,
                }}
              >
                00:45
              </Text>
              <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#86EFAC", marginTop: 6 }}>Active workout</Text>
              <Text
                style={{
                  fontFamily: font.extrabold,
                  fontSize: 24,
                  color: colors.white,
                  textAlign: "center",
                  marginTop: 20,
                  maxWidth: 320,
                }}
              >
                {exercise.name}
              </Text>
              <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#CBD5E1", marginTop: 8 }}>Exercise 2 of 10</Text>
              <View style={{ flex: 1 }} />
              <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#F8FAFC" }}>Skip</Text>
              <View
                style={{
                  marginTop: 20,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: 12,
                  width: "100%",
                }}
              >
                <Text style={{ fontFamily: font.extrabold, fontSize: 11, color: "#9CA3AF" }}>Upcoming</Text>
                <Text style={{ fontFamily: font.bold, fontSize: 13, color: "#F9FAFB", marginTop: 4 }}>Lunges · 00:40</Text>
              </View>
              <Pressable
                onPress={() => setPhase("paused")}
                style={{
                  marginTop: 24,
                  marginBottom: 12,
                  borderRadius: 22,
                  backgroundColor: "#052E16",
                  paddingVertical: 14,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons name="pause" size={28} color="#F8FAFC" />
              </Pressable>
            </View>
          )}

          {phase === "paused" && (
            <View style={{ flex: 1, marginTop: 20, alignItems: "center" }}>
              <Text style={{ fontFamily: font.extrabold, fontSize: 68, letterSpacing: -2.2, color: "#FDE68A" }}>00:23</Text>
              <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: "#F59E0B", marginTop: 6 }}>Paused</Text>
              <Text
                style={{
                  fontFamily: font.extrabold,
                  fontSize: 24,
                  color: colors.white,
                  textAlign: "center",
                  marginTop: 20,
                  maxWidth: 320,
                }}
              >
                {exercise.name}
              </Text>
              <Text style={{ fontFamily: font.bold, fontSize: 11, color: "#FED7AA", marginTop: 8 }}>Rest starts in 5s</Text>
              <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#CBD5E1", marginTop: 12 }}>Exercise 2 of 10</Text>
              <View style={{ flex: 1 }} />
              <View
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: 12,
                  width: "100%",
                }}
              >
                <Text style={{ fontFamily: font.extrabold, fontSize: 11, color: "#9CA3AF" }}>Upcoming</Text>
                <Text style={{ fontFamily: font.bold, fontSize: 13, color: "#F9FAFB", marginTop: 4 }}>Rest · 00:20</Text>
              </View>
              <Pressable
                onPress={() => setPhase("active")}
                style={{
                  marginBottom: 12,
                  borderRadius: 22,
                  backgroundColor: "#78350F",
                  paddingVertical: 14,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <MaterialCommunityIcons name="play" size={28} color="#F8FAFC" />
              </Pressable>
              <Pressable onPress={() => setPhase("completed")}>
                <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>End session (demo)</Text>
              </Pressable>
            </View>
          )}

          {phase === "completed" && (
            <View style={{ flex: 1, marginTop: 24, alignItems: "center" }}>
              <Text style={{ fontFamily: font.extrabold, fontSize: 32, letterSpacing: -0.8, color: colors.white }}>Great job!</Text>
              <Text style={{ fontFamily: font.bold, fontSize: 13, color: "#A7F3D0", marginTop: 8, textAlign: "center" }}>
                You completed all 10 exercises
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginTop: 28, width: "100%", justifyContent: "center" }}>
                <StatPill label="Calories" value="312 kcal" />
                <StatPill label="Duration" value="31 min" />
                <StatPill label="Streak" value="7 days" />
              </View>
              <View
                style={{
                  marginTop: 28,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: 14,
                  width: "100%",
                }}
              >
                <Text style={{ fontFamily: font.extrabold, fontSize: 11, color: "#9CA3AF" }}>Next suggestion</Text>
                <Text style={{ fontFamily: font.bold, fontSize: 13, color: "#F9FAFB", marginTop: 6 }}>Recovery Stretch · 12 min</Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12, width: "100%" }}>
                <Pressable
                  onPress={onDone}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    backgroundColor: "#E5E7EB",
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>Back to Plan</Text>
                </Pressable>
                <Pressable
                  onPress={onDone}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    backgroundColor: colors.emerald600,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
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
