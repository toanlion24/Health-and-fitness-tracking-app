import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { GradientPrimaryButton } from "../../auth/components/gradient-primary-button";
import { colors, iosCardShadow, radii, touch } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";
import { useWorkoutStore } from "../store/workout-store";
import { EXERCISES } from "../data/exercises";
import type { WorkoutStackScreenProps } from "../navigation/workout-stack-types";

const LEVEL_CHIP: Record<string, { bg: string; text: string }> = {
  beginner: { bg: "#DCFCE7", text: "#166534" },
  intermediate: { bg: "#EFF6FF", text: "#1D4ED8" },
  advanced: { bg: "#FEE2E2", text: "#B91C1C" },
};

export function WorkoutDetailScreen({ navigation, route }: WorkoutStackScreenProps<"WorkoutDetail">): ReactElement {
  const exercises = useWorkoutStore((s) => s.exercises);
  const exerciseItem = exercises.find((e) => String(e.id) === String(route.params.exerciseId));

  const staticDetails = EXERCISES.find(
    (e) =>
      e.id === route.params.exerciseId ||
      (exerciseItem && e.name.toLowerCase() === exerciseItem.name.toLowerCase())
  );

  const exercise = exerciseItem
    ? {
        id: String(exerciseItem.id),
        name: exerciseItem.name,
        level: staticDetails?.level || "intermediate",
        kcal: staticDetails?.kcal || 120,
        minutes: staticDetails?.minutes || 15,
        muscle: exerciseItem.muscleGroup || staticDetails?.muscle || "Muscle",
        setsReps: staticDetails?.setsReps || "4 sets × 8 reps",
        instructions: staticDetails?.instructions || [],
        tip: staticDetails?.tip || "Focus on form and control.",
        detailHeroUrl: staticDetails?.detailHeroUrl || "https://images.unsplash.com/photo-1574680096145-d05b474e2155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      }
    : staticDetails;

  if (exercise == null) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top", "left", "right", "bottom"]}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, padding: 24, justifyContent: "center" }}>
          <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.slate900 }}>Exercise not found.</Text>
          <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 15, color: colors.cyan600 }}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const lc = LEVEL_CHIP[exercise.level];

  const start = (): void => {
    navigation.navigate("WorkoutPlayer", {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sessionDate: new Date().toISOString().split("T")[0],
      phase: "active",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 8 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{
              width: touch.min,
              height: touch.min,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.slate200,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.white,
            }}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.slate900} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Favorite exercise"
            style={{
              width: touch.min,
              height: touch.min,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.slate200,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.white,
            }}
          >
            <MaterialCommunityIcons name="heart-outline" size={20} color={colors.slate900} />
          </Pressable>
        </View>

        <Image
          source={{ uri: exercise.detailHeroUrl }}
          style={{ width: "100%", height: 230, marginTop: 8 }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />

        <View style={{ paddingHorizontal: 20, gap: 14, marginTop: 12 }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 32, letterSpacing: -1, color: colors.slate900 }}>
            {exercise.name}
          </Text>
          <View style={{ alignSelf: "flex-start", borderRadius: 999, backgroundColor: lc.bg, paddingVertical: 6, paddingHorizontal: 10 }}>
            <Text style={{ fontFamily: font.bold, fontSize: 11, color: lc.text }}>
              {exercise.level.charAt(0).toUpperCase() + exercise.level.slice(1)}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <MetaChip text={`🔥 ${exercise.kcal} kcal`} />
            <MetaChip text={`⏱ ${exercise.minutes} min`} />
            <MetaChip text={`💪 ${exercise.muscle}`} />
          </View>

          <View
            style={{
              borderRadius: radii.cardMd,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.slate200,
              backgroundColor: colors.white,
              padding: 14,
              gap: 6,
              ...iosCardShadow,
            }}
          >
            <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: colors.slate500 }}>Sets & Reps</Text>
            <Text style={{ fontFamily: font.extrabold, fontSize: 18, color: colors.slate900 }}>{exercise.setsReps}</Text>
          </View>

          <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: colors.slate900 }}>Instructions</Text>
          {exercise.instructions.map((line, i) => (
            <Text key={i} style={{ fontFamily: font.semibold, fontSize: 12, lineHeight: 17, color: colors.slate700 }}>
              {i + 1}. {line}
            </Text>
          ))}

          <View
            style={{
              borderRadius: radii.cardMd,
              borderWidth: 1,
              borderColor: "#BFDBFE",
              backgroundColor: "#EFF6FF",
              padding: 12,
              gap: 6,
            }}
          >
            <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: "#1D4ED8" }}>Tips</Text>
            <Text style={{ fontFamily: font.bold, fontSize: 12, lineHeight: 17, color: "#1E3A8A" }}>{exercise.tip}</Text>
          </View>

          <GradientPrimaryButton label="Start Workout" onPress={start} height={60} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaChip(props: { text: string }): ReactElement {
  return (
    <View
      style={{
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.slate200,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: "#FAFBFC",
      }}
    >
      <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate700 }}>{props.text}</Text>
    </View>
  );
}
