import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Share,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { WorkoutStackScreenProps } from "../navigation/workout-stack-types";
import { useAuthStore } from "../../../core/store/auth-store";
import { getRunningSession, deleteRunningSession } from "../services/running-api";
import { fmtDistance, fmtDuration, fmtPace } from "../store/running-session-store";
import type { RunningSessionDto } from "@health-fitness/shared";

export function RunningDetailScreen({
  navigation,
  route,
}: WorkoutStackScreenProps<"RunningDetail">): ReactElement {
  const { _t } = useTranslation();
  const accessToken = useAuthStore((s) => s.tokens?.accessToken);
  const { sessionId } = route.params;

  const [session, setSession] = useState<RunningSessionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    getRunningSession(accessToken, sessionId)
      .then(setSession)
      .catch(() => setError("Không thể tải dữ liệu buổi chạy."))
      .finally(() => setIsLoading(false));
  }, [accessToken, sessionId]);

  const handleDelete = useCallback(() => {
    if (!accessToken) return;
    Alert.alert("Xóa buổi chạy?", "Hành động này không thể hoàn tác.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRunningSession(accessToken, sessionId);
            navigation.goBack();
          } catch {
            Alert.alert("Lỗi", "Không thể xóa buổi chạy.");
          }
        },
      },
    ]);
  }, [accessToken, sessionId, navigation]);

  const handleShare = useCallback(async () => {
    if (!session) return;
    const dist = fmtDistance(session.totalDistanceM);
    const dur = fmtDuration(session.totalDurationSec);
    const pace = fmtPace(session.avgPaceSecPerKm);
    const msg =
      `🏃 Buổi chạy ngày ${session.sessionDate}\n` +
      `📏 Quãng đường: ${dist}\n` +
      `⏱ Thời gian: ${dur}\n` +
      `⚡ Pace: ${pace}/km\n` +
      `🔥 Tiêu hao: ${session.kcalBurned} kcal\n\n` +
      `Theo dõi bằng Coach Kai App`;
    try {
      await Share.share({ message: msg });
    } catch {
      // ignore
    }
  }, [session]);

  if (isLoading) {
    return (
      <Module01Layout variant="onboardingBlue" contentInset={[8, 20, 12, 20]} scrollable={false}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.slate700} />
          <Text style={{ marginTop: 12, fontFamily: font.semibold, color: colors.slate500, fontSize: 13 }}>
            Đang tải...
          </Text>
        </View>
      </Module01Layout>
    );
  }

  if (error || !session) {
    return (
      <Module01Layout variant="onboardingBlue" contentInset={[8, 20, 12, 20]} scrollable={false}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
          </Pressable>
          <Text style={{ fontFamily: font.extrabold, fontSize: 20, color: colors.slate900 }}>
            Lỗi
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: font.semibold, color: colors.slate500 }}>
            {error ?? "Không tìm thấy buổi chạy."}
          </Text>
        </View>
      </Module01Layout>
    );
  }

  const distKm = (session.totalDistanceM / 1000).toFixed(2);
  const durMin = Math.round(session.totalDurationSec / 60);
  const avgPaceStr = fmtPace(session.avgPaceSecPerKm);
  const maxPaceStr = fmtPace(session.maxPaceSecPerKm);
  const elevationM = session.elevationGainM;

  return (
    <Module01Layout variant="onboardingBlue" contentInset={[8, 20, 12, 20]} scrollable={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={12}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: font.extrabold, fontSize: 20, color: colors.slate900 }}>
                🏃 Chi tiết buổi chạy
              </Text>
              <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate500 }}>
                {session.sessionDate} · {durMin} phút
              </Text>
            </View>
            <Pressable
              onPress={handleDelete}
              hitSlop={8}
              style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center" }}
              accessibilityRole="button"
              accessibilityLabel="Xóa"
            >
              <MaterialCommunityIcons name="delete-outline" size={20} color="#DC2626" />
            </Pressable>
          </View>

          {/* Summary hero card */}
          <LinearGradient
            colors={["#059669", "#0284C7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 24, gap: 16 }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontFamily: font.bold, fontSize: 48, color: colors.white }}>
                {distKm}
              </Text>
              <Text style={{ fontFamily: font.semibold, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
                km
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, padding: 12, alignItems: "center" }}>
                <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.white }}>
                  {avgPaceStr}
                </Text>
                <Text style={{ fontFamily: font.semibold, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                  PACE TB
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, padding: 12, alignItems: "center" }}>
                <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.white }}>
                  {fmtDuration(session.totalDurationSec)}
                </Text>
                <Text style={{ fontFamily: font.semibold, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                  THỜI GIAN
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, padding: 12, alignItems: "center" }}>
                <Text style={{ fontFamily: font.extrabold, fontSize: 22, color: colors.white }}>
                  {session.kcalBurned}
                </Text>
                <Text style={{ fontFamily: font.semibold, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                  KCAL
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Stats grid */}
          <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 20, gap: 16 }}>
            <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.slate900 }}>
              Thống kê chi tiết
            </Text>
            {[
              { icon: "map-marker-distance", label: "Quãng đường", value: `${distKm} km`, color: "#059669" },
              { icon: "timer-outline", label: "Thời gian", value: fmtDuration(session.totalDurationSec), color: "#0284C7" },
              { icon: "speedometer", label: "Pace trung bình", value: avgPaceStr, color: "#7C3AED" },
              { icon: "lightning-bolt", label: "Pace tốt nhất", value: maxPaceStr, color: "#D97706" },
              { icon: "fire", label: "Calories tiêu thụ", value: `${session.kcalBurned} kcal`, color: "#DC2626" },
              { icon: "walk", label: "Số bước ước tính", value: session.stepCount > 0 ? session.stepCount.toLocaleString("vi-VN") : "—", color: "#0369A1" },
              { icon: "terrain", label: "Độ cao tăng", value: elevationM > 0 ? `+${elevationM} m` : "—", color: "#059669" },
              { icon: "map-marker-path", label: "Điểm GPS", value: session.gpsPoints ? `${session.gpsPoints.length}` : "—", color: "#475569" },
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: item.color + "15", alignItems: "center", justifyContent: "center" }}>
                  <MaterialCommunityIcons name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={20} color={item.color} />
                </View>
                <Text style={{ flex: 1, fontFamily: font.semibold, fontSize: 13, color: colors.slate600 }}>
                  {item.label}
                </Text>
                <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate900 }}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          {/* GPS route preview */}
          {session.gpsPoints && session.gpsPoints.length > 2 && (
            <View style={{ backgroundColor: colors.white, borderRadius: 20, padding: 20 }}>
              <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.slate900, marginBottom: 12 }}>
                🗺 Lộ trình GPS
              </Text>
              <View style={{ backgroundColor: colors.slate100, borderRadius: 12, padding: 16, alignItems: "center", gap: 8 }}>
                <MaterialCommunityIcons name="map-marker-path" size={40} color={colors.slate400} />
                <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate500, textAlign: "center" }}>
                  {session.gpsPoints.length} điểm GPS đã ghi nhận.{`\n`}
                  Tổng quãng đường: {fmtDistance(session.totalDistanceM)}
                </Text>
                <Text style={{ fontFamily: font.semibold, fontSize: 11, color: colors.slate400 }}>
                  (Map sẽ hiển thị khi có react-native-maps)
                </Text>
              </View>
            </View>
          )}

          {/* AI Coach card */}
          <View style={{ backgroundColor: "#EFF6FF", borderRadius: 20, padding: 20, gap: 12, borderWidth: 1, borderColor: "#BFDBFE" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 24 }}>🤖</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: font.bold, fontSize: 15, color: colors.slate900 }}>
                  Hỏi Coach Kai
                </Text>
                <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate500 }}>
                  Nhận lời khuyên cá nhân hóa cho buổi chạy của bạn
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                // Navigate to AI coach with running context
                navigation.getParent()?.navigate("NotificationsAiCoach", {
                  initialMessage: `Buổi chạy ngày ${session.sessionDate}: ${distKm}km trong ${fmtDuration(session.totalDurationSec)}, pace ${avgPaceStr}/km, tiêu thụ ${session.kcalBurned} kcal. Đánh giá buổi chạy và đưa ra lời khuyên cho tôi?`,
                });
              }}
              style={{ backgroundColor: "#0284C7", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}
            >
              <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.white }}>
                💬 Phân tích buổi chạy với AI
              </Text>
            </Pressable>
          </View>

          {/* Share */}
          <Pressable
            onPress={handleShare}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.white, borderRadius: 16, paddingVertical: 14 }}
          >
            <MaterialCommunityIcons name="share-variant" size={18} color={colors.slate700} />
            <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate700 }}>
              Chia sẻ kết quả
            </Text>
          </Pressable>

          {/* Back button */}
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ alignItems: "center", paddingVertical: 8 }}
          >
            <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate400 }}>
              ← Quay lại
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Module01Layout>
  );
}
