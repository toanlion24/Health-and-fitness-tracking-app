import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, iosCardShadow, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { Exercise, ExerciseLevel } from "../data/exercises";
import { EXERCISES } from "../data/exercises";
import type { WorkoutStackScreenProps } from "../navigation/workout-stack-types";

type LevelFilter = "all" | ExerciseLevel;

const LEVEL_STYLES: Record<
  ExerciseLevel,
  { label: string; bg: string; text: string; chipBg: string; chipText: string }
> = {
  beginner: {
    label: "Beginner",
    bg: "#DCFCE7",
    text: "#166534",
    chipBg: "#DCFCE7",
    chipText: "#166534",
  },
  intermediate: {
    label: "Intermediate",
    bg: "#EFF6FF",
    text: "#1D4ED8",
    chipBg: "#EFF6FF",
    chipText: "#1D4ED8",
  },
  advanced: {
    label: "Advanced",
    bg: "#FEF2F2",
    text: "#B91C1C",
    chipBg: "#FEE2E2",
    chipText: "#B91C1C",
  },
};

const FILTER_CHIPS: { key: LevelFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
];

export function WorkoutListScreen({ navigation }: WorkoutStackScreenProps<"WorkoutList">): ReactElement {
  const [filter, setFilter] = useState<LevelFilter>("all");

  const data = useMemo(() => {
    if (filter === "all") return EXERCISES;
    return EXERCISES.filter((e) => e.level === filter);
  }, [filter]);

  return (
    <Module01Layout variant="workoutList" contentInset={[10, 20, 18, 20]} scrollable={false}>
      <View style={{ flex: 1, width: "100%" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 30, letterSpacing: -0.8, color: colors.slate900 }}>
            Workout
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search exercises"
            style={{
              width: touch.min,
              height: touch.min,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.slate200,
              backgroundColor: colors.white,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name="magnify" size={18} color={colors.slate700} />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          {FILTER_CHIPS.map((f) => {
            const selected = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[
                  {
                    borderRadius: 14,
                    paddingVertical: 9,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderColor: selected ? colors.emerald600 : "#CBD5E1",
                    backgroundColor: colors.white,
                  },
                  selected && { backgroundColor: "#ECFDF5" },
                ]}
              >
                <Text
                  style={{
                    fontFamily: font.bold,
                    fontSize: 11,
                    color: selected ? colors.emerald600 : colors.slate500,
                  }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Pressable
              onPress={() => navigation.navigate("WorkoutPlan")}
              style={{
                marginBottom: 12,
                borderRadius: radii.card,
                borderWidth: 1,
                borderColor: colors.slate200,
                backgroundColor: colors.white,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate900 }}>7-Day Plan</Text>
                <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500, marginTop: 4 }}>
                  Beginner · Fat Loss · tap to open
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.slate400} />
            </Pressable>
          }
          renderItem={({ item }) => (
            <ExerciseRow exercise={item} onPress={() => navigation.navigate("WorkoutDetail", { exerciseId: item.id })} />
          )}
        />
      </View>
    </Module01Layout>
  );
}

function ExerciseRow(props: { exercise: Exercise; onPress: () => void }): ReactElement {
  const { exercise, onPress } = props;
  const ls = LEVEL_STYLES[exercise.level];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.94 : 1,
        borderRadius: 22,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.slate200,
        backgroundColor: colors.white,
        padding: 14,
        gap: 12,
        ...iosCardShadow,
      })}
    >
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <Image
          source={{ uri: exercise.listImageUrl }}
          style={{ width: 64, height: 50, borderRadius: 12 }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 14, color: colors.slate900 }}>{exercise.name}</Text>
          <View
            style={{
              alignSelf: "flex-start",
              borderRadius: 999,
              backgroundColor: ls.chipBg,
              paddingVertical: 4,
              paddingHorizontal: 8,
            }}
          >
            <Text style={{ fontFamily: font.bold, fontSize: 10, color: ls.chipText }}>{ls.label}</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontFamily: font.extrabold, fontSize: 10, color: colors.slate600 }}>
          🔥 {exercise.kcal} kcal · ⏱ {exercise.minutes} min · 💪 {exercise.muscle}
        </Text>
        <View style={{ borderRadius: 10, backgroundColor: colors.slate900, paddingVertical: 7, paddingHorizontal: 10 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 11, color: colors.white }}>Start</Text>
        </View>
      </View>
    </Pressable>
  );
}
