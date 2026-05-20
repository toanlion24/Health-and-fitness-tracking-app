import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import { getExerciseById } from "../data/exercises";
import type { WorkoutStackScreenProps } from "../navigation/workout-stack-types";

export function WorkoutDetailScreen({
  navigation,
  route,
}: WorkoutStackScreenProps<"WorkoutDetail">): ReactElement {
  // Lấy insets để tự động né "tai thỏ" (notch) hoặc thanh trạng thái của điện thoại
  const insets = useSafeAreaInsets();
  const exercise = getExerciseById(route.params.exerciseId);

  if (!exercise) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white }}>
        <Text style={{ fontFamily: font.bold, color: colors.slate500 }}>Exercise not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      {/* Ép màu chữ trên thanh trạng thái thành màu trắng để nổi bật trên nền ảnh */}
      <StatusBar style="light" />
      
      {/* ScrollView chứa nội dung chính */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }} // Chừa chỗ cho nút Start ở đáy
      >
        {/* Khối Hero Image tràn viền trên */}
        <View style={{ width: "100%", height: 340 }}>
          <Image source={{ uri: exercise.detailHeroUrl }} style={{ flex: 1 }} resizeMode="cover" />
          
          {/* Lớp phủ đen Gradient từ trên xuống để làm rõ nút Back */}
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "transparent"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: 140 }}
          />
          
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={{ 
              position: "absolute", 
              top: insets.top + 10, 
              left: 20, 
              width: 44, 
              height: 44, 
              borderRadius: 22, 
              backgroundColor: "rgba(0,0,0,0.25)", 
              alignItems: "center", 
              justifyContent: "center",
              backdropFilter: "blur(10px)" // Hiệu ứng kính mờ xịn xò
            }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.white} />
          </Pressable>
        </View>

        {/* Khối Thông tin chi tiết */}
        <View style={{ padding: 24, gap: 24 }}>
          
          {/* Header */}
          <View>
            <Text style={{ fontFamily: font.extrabold, fontSize: 32, color: colors.slate900, letterSpacing: -0.5 }}>
              {exercise.name}
            </Text>
            <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate500, marginTop: 8 }}>
              🔥 {exercise.kcal} kcal  ·  ⏱ {exercise.minutes} min  ·  💪 {exercise.muscle}
            </Text>
            <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate400, marginTop: 4 }}>
              Recommendation: {exercise.setsReps}
            </Text>
          </View>

          <View style={{ height: 1, backgroundColor: colors.slate100 }} />

          {/* Khối Hướng dẫn từng bước (Instructions) */}
          <View style={{ gap: 16 }}>
            <Text style={{ fontFamily: font.extrabold, fontSize: 20, color: colors.slate900 }}>
              How to perform
            </Text>
            
            {exercise.instructions.map((inst, idx) => (
              <View key={idx} style={{ flexDirection: "row", gap: 14 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.slate100, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: font.extrabold, fontSize: 12, color: colors.slate700 }}>
                    {idx + 1}
                  </Text>
                </View>
                <Text style={{ flex: 1, fontFamily: font.semibold, fontSize: 15, color: colors.slate700, lineHeight: 24, paddingTop: 2 }}>
                  {inst}
                </Text>
              </View>
            ))}
          </View>

          {/* Khối Lời khuyên (Pro Tip) */}
          <View style={{ backgroundColor: "#EFF6FF", borderRadius: 16, padding: 18, flexDirection: "row", gap: 14 }}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={26} color="#2563EB" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.extrabold, fontSize: 14, color: "#1E3A8A" }}>
                Coach's Tip
              </Text>
              <Text style={{ fontFamily: font.semibold, fontSize: 14, color: "#1D4ED8", marginTop: 4, lineHeight: 22 }}>
                {exercise.tip}
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Khối Nút Start cố định ở đáy màn hình */}
      <View 
        style={{ 
          position: "absolute", 
          bottom: 0, 
          left: 0, 
          right: 0, 
          paddingHorizontal: 24, 
          paddingTop: 16,
          // Đẩy phần padding bottom lên để không bị vướng thanh vuốt (Home Indicator) của iOS
          paddingBottom: Math.max(insets.bottom + 8, 24), 
          backgroundColor: colors.white, 
          borderTopWidth: 1, 
          borderTopColor: colors.slate100 
        }}
      >
        <Pressable
          onPress={() => navigation.navigate("WorkoutPlayer", { exerciseId: exercise.id, phase: "paused" })}
        >
          <LinearGradient
            colors={["#059669", "#0284C7"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ borderRadius: 18, paddingVertical: 18, alignItems: "center" }}
          >
            <Text style={{ fontFamily: font.extrabold, fontSize: 16, color: colors.white }}>
              Start This Exercise
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}