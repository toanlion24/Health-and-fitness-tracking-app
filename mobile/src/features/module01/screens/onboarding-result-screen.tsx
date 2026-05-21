import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Text, View } from "react-native";
// import * as Notifications from "expo-notifications"; // Commented out to prevent crash on Expo Go SDK 53
import { Platform } from "react-native";
import type { Module01StackScreenProps } from "../../../core/navigation/module01-types";
import { GradientPrimaryButton } from "../components/gradient-primary-button";
import { Module01Layout } from "../components/module01-layout";
import { computeBmi, bmiCategory, computeEnergyTargets, recommendationCopy } from "../lib/metrics";
import { fetchApi } from "../../../core/lib/api";
import { useAuthStore } from "../../../core/store/auth-store";
import { useModule01Store } from "../store/module01-store";
import { colors, layout } from "../theme/tokens";
import { font } from "../theme/fonts";

function bmiMarkerRatio(bmi: number): number {
  const min = 16;
  const max = 35;
  return Math.min(1, Math.max(0, (bmi - min) / (max - min)));
}

export function OnboardingResultScreen({ navigation }: Module01StackScreenProps<"OnboardingResult">): ReactElement {
  const profile = useModule01Store();
  const bmi = computeBmi(profile.heightCm, profile.weightKg);
  const cat = bmiCategory(bmi);
  const { bmr, tdee } = computeEnergyTargets(
    profile.gender,
    profile.age,
    profile.heightCm,
    profile.weightKg,
    profile.activity,
  );
  const rec = recommendationCopy(profile.goal, tdee);
  const marker = bmiMarkerRatio(bmi);

  return (
    <Module01Layout variant="result" contentInset={layout.contentPadResult} scrollable>
      <View style={{ width: "100%", gap: 20, flex: 1 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 13, letterSpacing: 0.8, color: colors.slate500 }}>Your metrics</Text>
        <Text
          style={{
            fontFamily: font.extrabold,
            fontSize: 24,
            letterSpacing: -0.6,
            color: colors.slate900,
            maxWidth: 350,
          }}
        >
          Based on your profile
        </Text>

        <View
          style={{
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            paddingVertical: 24,
            paddingHorizontal: 22,
            gap: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", width: "100%" }}>
            <Text style={{ fontFamily: font.extrabold, fontSize: 48, letterSpacing: -1.5, color: colors.slate900 }}>
              {bmi.toFixed(1)}
            </Text>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>BMI</Text>
              <Text
                style={{
                  fontFamily: font.semibold,
                  fontSize: 13,
                  color: cat.tone === "healthy" ? colors.emerald600 : "#D97706",
                }}
              >
                {cat.label}
              </Text>
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.slate200, overflow: "hidden" }}>
              <LinearGradient
                colors={["#FCD34D", "#10B981", "#FB7185"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ height: 12, width: "100%", opacity: 0.25 }}
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 3,
                  marginLeft: -1.5,
                  left: `${marker * 100}%` as `${number}%`,
                  backgroundColor: colors.slate900,
                  borderRadius: 2,
                }}
              />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <Text style={{ fontFamily: font.regular, fontSize: 10, color: colors.slate400 }}>Under</Text>
              <Text style={{ fontFamily: font.semibold, fontSize: 10, color: colors.emerald600 }}>Healthy</Text>
              <Text style={{ fontFamily: font.regular, fontSize: 10, color: colors.slate400 }}>Over</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 14, width: "100%" }}>
          <View
            style={{
              flex: 1,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.slate200,
              backgroundColor: colors.white,
              paddingVertical: 20,
              paddingHorizontal: 18,
              gap: 8,
            }}
          >
            <MaterialCommunityIcons name="fire" size={22} color={colors.orange500} />
            <Text style={{ fontFamily: font.extrabold, fontSize: 28, letterSpacing: -0.8, color: colors.slate900 }}>
              {bmr.toLocaleString()}
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: 12, color: colors.slate500 }}>BMR · kcal/day</Text>
          </View>
          <View
            style={{
              flex: 1,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.slate200,
              backgroundColor: colors.white,
              paddingVertical: 20,
              paddingHorizontal: 18,
              gap: 8,
            }}
          >
            <MaterialCommunityIcons name="speedometer" size={22} color={colors.sky500} />
            <Text style={{ fontFamily: font.extrabold, fontSize: 28, letterSpacing: -0.8, color: colors.slate900 }}>
              {tdee.toLocaleString()}
            </Text>
            <Text style={{ fontFamily: font.regular, fontSize: 12, color: colors.slate500 }}>TDEE · kcal/day</Text>
          </View>
        </View>

        <View style={{ gap: 10, paddingTop: 4, width: "100%" }}>
          <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
            <MaterialCommunityIcons name="star-four-points-outline" size={20} color={colors.sky500} />
            <Text
              style={{
                flex: 1,
                fontFamily: font.regular,
                fontSize: 14,
                lineHeight: 21,
                color: colors.slate600,
                maxWidth: 300,
              }}
            >
              {rec}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 12 }} />
        <GradientPrimaryButton label="Continue to app" height={56} onPress={async () => {
          try {
            const dob = new Date();
            dob.setFullYear(dob.getFullYear() - profile.age);
            
            // 1. Cập nhật Profile
            await fetchApi('/users/me/profile', {
              method: 'PATCH',
              body: JSON.stringify({
                gender: profile.gender,
                dob: dob.toISOString().split('T')[0],
                heightCm: profile.heightCm,
                activityLevel: profile.activity,
              })
            });

            // 2. Thêm body metrics (cân nặng)
            await fetchApi('/body-metrics', {
              method: 'POST',
              body: JSON.stringify({
                recordedAt: new Date().toISOString(),
                weightKg: profile.weightKg
              })
            });

            // 3. Cập nhật Goals
            const goalMapping: Record<string, string> = {
              lose: "weight_loss",
              gain: "muscle_gain",
              maintain: "maintenance",
            };
            const mappedGoalType = goalMapping[profile.goal] || "maintenance";

            await fetchApi('/users/me/goals', {
              method: 'PUT',
              body: JSON.stringify({
                goalType: mappedGoalType,
                dailyKcalTarget: Math.round(tdee),
                isActive: true
              })
            });

            // 4. Tạo các nhắc nhở mặc định
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Ho_Chi_Minh";
            const defaultReminders = [
              { type: "water", title: "💧 Uống nước", message: "Đừng quên uống đủ nước nhé!", localHour: 9, localMinute: 0 },
              { type: "water", title: "💧 Uống nước", message: "Nhắc nhở uống nước buổi trưa.", localHour: 13, localMinute: 0 },
              { type: "water", title: "💧 Uống nước", message: "Uống thêm nước buổi chiều nào!", localHour: 16, localMinute: 0 },
              { type: "workout", title: "🏋️ Đến giờ tập rồi!", message: "Bắt đầu buổi tập của bạn hôm nay.", localHour: 18, localMinute: 0 },
              { type: "meal", title: "🍽️ Nhắc bữa tối", message: "Đã đến giờ bữa tối, đừng bỏ bữa nhé!", localHour: 19, localMinute: 0 },
            ];
            for (const r of defaultReminders) {
              await fetchApi('/reminders', {
                method: 'POST',
                body: JSON.stringify({ ...r, timezone, isEnabled: true })
              });
            }

            // 5. Đăng ký Expo Push Token (Bỏ qua trên Expo Go từ SDK 53+)
            // Do remote notifications không còn được hỗ trợ trong Expo Go từ SDK 53, việc require("expo-notifications")
            // sẽ kích hoạt side-effects toàn cục gây lỗi crash khi khởi động Metro.
            console.log("Push token registration skipped in Expo Go (remote notifications not supported since SDK 53)");

            useAuthStore.getState().completeOnboarding();
            navigation.replace("MainTabs");
          } catch (e) {
            console.log('Lỗi lưu onboarding:', e);
            useAuthStore.getState().completeOnboarding();
            navigation.replace("MainTabs");
          }
        }} />
      </View>
    </Module01Layout>
  );
}
