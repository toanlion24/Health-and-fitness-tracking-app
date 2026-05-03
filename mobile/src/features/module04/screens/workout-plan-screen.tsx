import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, radii, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { WorkoutStackScreenProps } from "../navigation/workout-stack-types";

const DAYS = [
  { id: "d1", label: "D1", sub: "Now", active: true },
  { id: "d2", label: "D2", sub: null, active: false },
  { id: "d3", label: "D3", sub: null, active: false },
  { id: "d4", label: "D4", sub: null, active: false },
  { id: "d5", label: "D5", sub: null, active: false },
  { id: "d6", label: "D6", sub: null, active: false },
  { id: "d7", label: "D7", sub: "Rest", active: false, rest: true },
];

const DAY_EXERCISES = ["Push Up · 4 min", "Squat · 4 min", "Plank · 3 min", "Jumping Jack · 3 min"];

export function WorkoutPlanScreen({ navigation }: WorkoutStackScreenProps<"WorkoutPlan">): ReactElement {
  return (
    <Module01Layout variant="workoutList" contentInset={[10, 20, 22, 20]} scrollable>
      <View style={{ width: "100%", gap: 16, flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
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
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.slate900} />
          </Pressable>
          <Text style={{ fontFamily: font.extrabold, fontSize: 14, color: colors.slate900 }}>Plan</Text>
          <View style={{ width: touch.min }} />
        </View>

        <Text style={{ fontFamily: font.extrabold, fontSize: 28, letterSpacing: -0.7, color: colors.slate900 }}>
          7-Day Plan
        </Text>
        <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>Beginner · Fat Loss</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          {DAYS.map((d) => (
            <View
              key={d.id}
              style={{
                borderRadius: 14,
                paddingVertical: 10,
                paddingHorizontal: 12,
                minWidth: 52,
                alignItems: "center",
                backgroundColor: d.active ? "#DCFCE7" : colors.white,
                borderWidth: d.active ? 0 : 1,
                borderColor: colors.slate200,
              }}
            >
              <Text
                style={{
                  fontFamily: font.extrabold,
                  fontSize: 10,
                  color: d.active ? "#166534" : colors.slate500,
                }}
              >
                {d.label}
              </Text>
              {d.sub != null && (
                <Text style={{ fontFamily: font.bold, fontSize: 9, color: d.rest ? "#B45309" : "#0284C7", marginTop: 4 }}>
                  {d.sub}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>

        <View
          style={{
            borderRadius: radii.card,
            borderWidth: 1,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            padding: 18,
            gap: 10,
          }}
        >
          <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: colors.slate900 }}>Today · Full Body Burn</Text>
          <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>
            10 exercises · 32 min · ~310 kcal
          </Text>
          <LinearGradient
            colors={["#059669", "#0284C7"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 4 }}
          >
            <Text style={{ fontFamily: font.extrabold, fontSize: 15, color: colors.white }}>Start</Text>
          </LinearGradient>
        </View>

        <Text style={{ fontFamily: font.extrabold, fontSize: 13, color: colors.slate900 }}>Exercise List</Text>
        {DAY_EXERCISES.map((line) => (
          <Text key={line} style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate700 }}>
            {line}
          </Text>
        ))}
        <Text style={{ fontFamily: font.bold, fontSize: 11, color: colors.slate400 }}>... +6 exercises</Text>

        <Pressable
          onPress={() => navigation.navigate("WorkoutPlayer", { exerciseId: "push-up", phase: "active" })}
          style={{ marginTop: 8 }}
        >
          <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.cyan600 }}>
            Jump into demo player (Push Up) →
          </Text>
        </Pressable>
      </View>
    </Module01Layout>
  );
}
