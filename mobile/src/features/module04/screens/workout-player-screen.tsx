import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useState, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { colors, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import { EXERCISES } from "../data/exercises";
import type {
  WorkoutPlayerPhase,
  WorkoutStackScreenProps,
} from "../navigation/workout-stack-types";

const BG: Record<WorkoutPlayerPhase, [string, string]> = {
  active: ["#0F172A", "#0B3D4A"],
  paused: ["#131A24", "#114054"],
  completed: ["#101826", "#0F3D54"],
};

const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export function WorkoutPlayerScreen({
  navigation,
  route,
}: WorkoutStackScreenProps<"WorkoutPlayer">): ReactElement {
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [phase, setPhase] = useState<WorkoutPlayerPhase>("paused");

  const playlist = EXERCISES; 
  const totalExercises = playlist.length;
  const exercise = playlist[currentIndex];
  const nextExercise = playlist[currentIndex + 1];
  const isLastExercise = currentIndex === totalExercises - 1;

  // [DEV MODE] Hiện tại vẫn đang dùng giây để test cho nhanh
  const [timeLeft, setTimeLeft] = useState(exercise ? exercise.minutes * 60 : 0);

  // 2. Khi có bài tập mới, tự động reset thời gian
  useEffect(() => {
    if (exercise) {
      setTimeLeft(exercise.minutes * 60); 
    }
  }, [currentIndex, exercise]);

  useEffect(() => {
    if (phase !== "active") return; 

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Tự động chuyển bài khi hết giờ
  useEffect(() => {
    if (timeLeft === 0 && phase === "active") {
      handleNextExercise();
    }
  }, [timeLeft, phase]);

  if (!exercise) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.slate900 }}>
        <Text style={{ color: colors.white, padding: 20 }}>Missing exercise.</Text>
      </SafeAreaView>
    );
  }

  const handleNextExercise = () => {
    if (isLastExercise) {
      setPhase("completed");
    } else {
      setCurrentIndex((prev) => prev + 1);
      // 👉 Chuyển sang bài mới cũng sẽ ở trạng thái chờ người dùng bấm Play
      setPhase("paused");
    }
  };
  
  // 👉 3. Hàm Reset thời gian về lại mốc ban đầu của bài tập
  const handleReset = () => {
    if (exercise) {
      setTimeLeft(exercise.minutes * 60);
    }
  };

  const onDone = (): void => {
    navigation.popToTop();
  };

  // Biến cờ kiểm tra xem bài tập đã bắt đầu chưa (để thay đổi chữ hiển thị)
  const isNotStarted = timeLeft === exercise.minutes * 60;

  return (
    <LinearGradient
      colors={BG[phase]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
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
            <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: "#F8FAFC" }}>
              Workout Player
            </Text>
            <Pressable
              hitSlop={8}
              style={{ width: touch.min, height: touch.min, alignItems: "center", justifyContent: "center" }}
            >
              <MaterialCommunityIcons name="dots-horizontal" size={20} color="#F8FAFC" />
            </Pressable>
          </View>

          {phase === "active" && (
            <View style={{ flex: 1, marginTop: 20, alignItems: "center" }}>
              <Text style={{ fontFamily: font.extrabold, fontSize: 64, letterSpacing: -2, color: colors.white }}>
                {formatTime(timeLeft)}
              </Text>
              <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#86EFAC", marginTop: 6 }}>
                Active workout
              </Text>
              
              <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: colors.white, textAlign: "center", marginTop: 20, maxWidth: 320 }}>
                {exercise.name}
              </Text>
              
              <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#CBD5E1", marginTop: 8 }}>
                Exercise {currentIndex + 1} of {totalExercises}
              </Text>
              
              <View style={{ flex: 1 }} />
              
              <Pressable onPress={handleNextExercise} hitSlop={12}>
                <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#F8FAFC" }}>
                  {isLastExercise ? "Finish Session" : "Skip"}
                </Text>
              </Pressable>
              
              <View style={{ marginTop: 20, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", padding: 12, width: "100%" }}>
                <Text style={{ fontFamily: font.extrabold, fontSize: 11, color: "#9CA3AF" }}>
                  {isLastExercise ? "Up Next" : "Upcoming"}
                </Text>
                <Text style={{ fontFamily: font.bold, fontSize: 13, color: "#F9FAFB", marginTop: 4 }}>
                  {isLastExercise ? "Well deserved rest!" : `${nextExercise?.name} · ${formatTime(nextExercise?.minutes)}`}
                </Text>
              </View>

              {/* Gắn Nút Reset & Nút Pause nằm cạnh nhau */}
              <View style={{ flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 12, width: "100%" }}>
                <Pressable
                  onPress={handleReset}
                  style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}
                >
                  <MaterialCommunityIcons name="restart" size={26} color="#9CA3AF" />
                </Pressable>

                <Pressable
                  onPress={() => setPhase("paused")}
                  style={{ flex: 1, height: 56, borderRadius: 28, backgroundColor: "#052E16", alignItems: "center", justifyContent: "center" }}
                >
                  <MaterialCommunityIcons name="pause" size={28} color="#F8FAFC" />
                </Pressable>
              </View>
            </View>
          )}

          {phase === "paused" && (
            <View style={{ flex: 1, marginTop: 20, alignItems: "center" }}>
              <Text style={{ fontFamily: font.extrabold, fontSize: 68, letterSpacing: -2.2, color: "#FDE68A" }}>
                {formatTime(timeLeft)}
              </Text>
              
              {/* Đổi text linh hoạt nếu chưa bắt đầu */}
              <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: "#F59E0B", marginTop: 6 }}>
                {isNotStarted ? "Ready to start" : "Paused"}
              </Text>
              
              <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: colors.white, textAlign: "center", marginTop: 20, maxWidth: 320 }}>
                {exercise.name}
              </Text>
              
              <Text style={{ fontFamily: font.bold, fontSize: 11, color: "#FED7AA", marginTop: 8 }}>
                {isNotStarted ? "Press play to begin!" : "Don't rest too long!"}
              </Text>
              
              <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#CBD5E1", marginTop: 12 }}>
                Exercise {currentIndex + 1} of {totalExercises}
              </Text>
              
              <View style={{ flex: 1 }} />
              
              <View style={{ marginBottom: 16, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.08)", padding: 12, width: "100%" }}>
                <Text style={{ fontFamily: font.extrabold, fontSize: 11, color: "#9CA3AF" }}>Upcoming</Text>
                <Text style={{ fontFamily: font.bold, fontSize: 13, color: "#F9FAFB", marginTop: 4 }}>
                  {isLastExercise ? "Finish Line!" : `${nextExercise?.name} is waiting`}
                </Text>
              </View>

              {/* Gắn Nút Reset & Nút Play nằm cạnh nhau */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12, width: "100%" }}>
                <Pressable
                  onPress={handleReset}
                  style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}
                >
                  <MaterialCommunityIcons name="restart" size={26} color="#9CA3AF" />
                </Pressable>

                <Pressable
                  onPress={() => setPhase("active")}
                  style={{ flex: 1, height: 56, borderRadius: 28, backgroundColor: "#78350F", alignItems: "center", justifyContent: "center" }}
                >
                  <MaterialCommunityIcons name="play" size={28} color="#F8FAFC" />
                </Pressable>
              </View>
              
              <Pressable onPress={() => setPhase("completed")} hitSlop={12}>
                <Text style={{ fontFamily: font.bold, fontSize: 12, color: "#94A3B8", marginBottom: 16 }}>
                  End session early
                </Text>
              </Pressable>
            </View>
          )}

          {phase === "completed" && (
            <View style={{ flex: 1, marginTop: 24, alignItems: "center" }}>
              <Text style={{ fontFamily: font.extrabold, fontSize: 32, letterSpacing: -0.8, color: colors.white }}>
                Great job!
              </Text>
              <Text style={{ fontFamily: font.bold, fontSize: 13, color: "#A7F3D0", marginTop: 8, textAlign: "center" }}>
                You completed {currentIndex === totalExercises - 1 ? "all" : currentIndex} exercises
              </Text>
              <View style={{ flexDirection: "row", gap: 12, marginTop: 28, width: "100%", justifyContent: "center" }}>
                <StatPill label="Calories" value="312 kcal" />
                <StatPill label="Duration" value="31 min" />
                <StatPill label="Streak" value="7 days" />
              </View>
              <View style={{ marginTop: 28, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", padding: 14, width: "100%" }}>
                <Text style={{ fontFamily: font.extrabold, fontSize: 11, color: "#9CA3AF" }}>Next suggestion</Text>
                <Text style={{ fontFamily: font.bold, fontSize: 13, color: "#F9FAFB", marginTop: 6 }}>
                  Recovery Stretch · 12 min
                </Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12, width: "100%" }}>
                <Pressable
                  onPress={onDone}
                  style={{ flex: 1, borderRadius: 14, backgroundColor: "#E5E7EB", paddingVertical: 14, alignItems: "center" }}
                >
                  <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>Back to Plan</Text>
                </Pressable>
                <Pressable
                  onPress={onDone}
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
      <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: colors.white, marginTop: 4 }}>
        {props.value}
      </Text>
    </View>
  );
}