import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, iosCardShadow, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { WorkoutStackScreenProps } from "../navigation/workout-stack-types";
import { useWorkoutStore, type ExerciseItem } from "../store/workout-store";

const MUSCLE_CHIPS = [
  { key: "", label: "All" },
  { key: "chest", label: "Chest" },
  { key: "back", label: "Back" },
  { key: "legs", label: "Legs" },
  { key: "shoulders", label: "Shoulders" },
  { key: "biceps", label: "Biceps" },
  { key: "abdominals", label: "Abs" },
] as const;

export function WorkoutListScreen({ navigation }: WorkoutStackScreenProps<"WorkoutList">): ReactElement {
  const [searchQuery, setSearchQuery] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [searching, setSearching] = useState(false);

  const exercises = useWorkoutStore((s) => s.exercises);
  const loadingExercises = useWorkoutStore((s) => s.loadingExercises);
  const fetchExercises = useWorkoutStore((s) => s.fetchExercises);

  // Load danh sách bài tập ban đầu
  useEffect(() => {
    void fetchExercises();
  }, []);

  // Tìm kiếm khi query thay đổi (debounced)
  useEffect(() => {
    if (searchQuery.length > 0 && searchQuery.length < 2) return;
    setSearching(true);
    const timer = setTimeout(() => {
      void fetchExercises(searchQuery, muscleFilter).finally(() => setSearching(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, muscleFilter]);

  const handleMuscleChange = (muscle: string): void => {
    setMuscleFilter(muscle);
    void fetchExercises(searchQuery, muscle);
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Module01Layout variant="workoutList" contentInset={[10, 20, 18, 20]} scrollable={false}>
      <View style={{ flex: 1, width: "100%" }}>
        {/* Header */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 30, letterSpacing: -0.8, color: colors.slate900 }}>Workout</Text>
          <Pressable
            onPress={() => navigation.navigate("WorkoutPlan")}
            accessibilityRole="button"
            accessibilityLabel="View workout plan"
            style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.emerald600 }}
          >
            <MaterialCommunityIcons name="clipboard-list-outline" size={16} color={colors.white} />
            <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.white }}>My Plans</Text>
          </Pressable>
        </View>

        {/* Search bar */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.slate200, backgroundColor: colors.white, paddingHorizontal: 12, height: 44 }}>
          <MaterialCommunityIcons name="magnify" size={18} color={colors.slate400} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exercises (e.g. bench press)..."
            placeholderTextColor={colors.slate400}
            style={{ flex: 1, fontFamily: font.medium, fontSize: 14, color: colors.slate900 }}
          />
          {(searching || loadingExercises) && <ActivityIndicator size="small" color={colors.cyan600} />}
        </View>

        {/* Muscle filter chips */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
          {MUSCLE_CHIPS.map((chip) => {
            const selected = muscleFilter === chip.key;
            return (
              <Pressable
                key={chip.key}
                onPress={() => handleMuscleChange(chip.key)}
                style={[
                  { borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: selected ? colors.emerald600 : "#CBD5E1", backgroundColor: colors.white },
                  selected && { backgroundColor: "#ECFDF5" },
                ]}
              >
                <Text style={{ fontFamily: font.bold, fontSize: 11, color: selected ? colors.emerald600 : colors.slate500 }}>
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Exercise list */}
        {exercises.length === 0 && !loadingExercises ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 40 }}>
            <MaterialCommunityIcons name="dumbbell" size={48} color={colors.slate300} />
            <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate400, textAlign: "center" }}>
              {searchQuery ? `No results for "${searchQuery}"` : "Enter a search term to find exercises"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={exercises}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ExerciseRow
                exercise={item}
                onPress={() => {
                  const today2 = new Date().toISOString().slice(0, 10);
                  navigation.navigate("WorkoutPlayer", { exerciseId: item.id, exerciseName: item.name, sessionDate: today2, phase: "active" });
                }}
              />
            )}
            ListEmptyComponent={
              loadingExercises ? (
                <View style={{ paddingTop: 40, alignItems: "center" }}>
                  <ActivityIndicator color={colors.cyan600} />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </Module01Layout>
  );
}

function ExerciseRow(props: { exercise: ExerciseItem; onPress: () => void }): ReactElement {
  const { exercise, onPress } = props;
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
        gap: 8,
        ...iosCardShadow,
      })}
    >
      <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: "#ECFDF5", alignItems: "center", justifyContent: "center" }}>
          <MaterialCommunityIcons name="dumbbell" size={22} color={colors.emerald600} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontFamily: font.extrabold, fontSize: 14, color: colors.slate900 }}>{exercise.name}</Text>
          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
            {exercise.muscleGroup ? (
              <View style={{ borderRadius: 999, backgroundColor: "#ECFDF5", paddingVertical: 3, paddingHorizontal: 8 }}>
                <Text style={{ fontFamily: font.bold, fontSize: 10, color: colors.emerald600 }}>{exercise.muscleGroup}</Text>
              </View>
            ) : null}
            {exercise.equipment ? (
              <View style={{ borderRadius: 999, backgroundColor: colors.slate100, paddingVertical: 3, paddingHorizontal: 8 }}>
                <Text style={{ fontFamily: font.bold, fontSize: 10, color: colors.slate500 }}>{exercise.equipment}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={{ borderRadius: 10, backgroundColor: colors.slate900, paddingVertical: 7, paddingHorizontal: 10 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 11, color: colors.white }}>Start</Text>
        </View>
      </View>
      {exercise.met ? (
        <Text style={{ fontFamily: font.semibold, fontSize: 10, color: colors.slate400 }}>
          🔥 MET {Number(exercise.met).toFixed(1)} · Tap to begin session
        </Text>
      ) : null}
    </Pressable>
  );
}
