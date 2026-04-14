import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import { useAuthStore } from "../../core/store/auth-store";
import type { AppStackParamList } from "../../core/navigation/types";
import { EmptyState } from "../../core/ui-states/empty-state";
import { ScreenScroll } from "../../core/ui/screen-scaffold";
import { appTheme } from "../../core/theme/app-theme";

type Props = StackScreenProps<AppStackParamList, "Home">;

const MENU = [
  {
    title: "Hồ sơ & mục tiêu",
    subtitle: "Cập nhật thông tin cá nhân",
    to: "Profile" as const,
    params: undefined,
    emoji: "👤",
  },
  {
    title: "Tập luyện",
    subtitle: "Danh mục bài tập, buổi tập",
    to: "Workouts" as const,
    params: undefined,
    emoji: "🏋️",
  },
  {
    title: "Dinh dưỡng",
    subtitle: "Nhật ký bữa ăn theo ngày",
    to: "Nutrition" as const,
    params: undefined,
    emoji: "🍽️",
  },
  {
    title: "Chỉ số cơ thể",
    subtitle: "Cân nặng, chỉ số theo thời gian",
    to: "BodyMetrics" as const,
    params: undefined,
    emoji: "📊",
  },
];

export function HomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  if (!user) {
    return (
      <EmptyState
        title="Not signed in"
        description="Please sign in to continue."
      />
    );
  }

  return (
    <ScreenScroll>
      <Text style={styles.greeting}>Xin chào</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.hint}>Chọn chức năng để ghi nhận dữ liệu hằng ngày.</Text>

      <View style={styles.grid}>
        {MENU.map((item) => (
          <Pressable
            key={item.to}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              navigation.navigate(item.to, item.params as never)
            }
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.subtitle}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
        onPress={() => void logout()}
      >
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 28,
    fontWeight: "800",
    color: appTheme.colors.text,
  },
  email: {
    marginTop: 4,
    fontSize: 15,
    color: appTheme.colors.textMuted,
  },
  hint: {
    marginTop: appTheme.space.md,
    fontSize: 14,
    lineHeight: 20,
    color: appTheme.colors.textSoft,
  },
  grid: {
    marginTop: appTheme.space.lg,
    gap: appTheme.space.sm,
  },
  card: {
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.radius.lg,
    padding: appTheme.space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    ...appTheme.shadow.card,
  },
  cardPressed: {
    opacity: 0.92,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: appTheme.colors.text,
  },
  cardSub: {
    marginTop: 4,
    fontSize: 13,
    color: appTheme.colors.textMuted,
    lineHeight: 18,
  },
  logout: {
    marginTop: appTheme.space.xl,
    alignSelf: "flex-start",
    backgroundColor: appTheme.colors.text,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: appTheme.radius.md,
  },
  logoutPressed: {
    opacity: 0.92,
  },
  logoutText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});
