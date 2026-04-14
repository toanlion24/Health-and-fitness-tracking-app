import { Pressable, StyleSheet, Text, View } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import { useAuthStore } from "../../core/store/auth-store";
import type { AppStackParamList } from "../../core/navigation/types";
import { EmptyState } from "../../core/ui-states/empty-state";

type Props = StackScreenProps<AppStackParamList, "Home">;

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
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>{user.email}</Text>

      <Pressable
        style={styles.secondary}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.secondaryText}>Hồ sơ & mục tiêu</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => void logout()}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    opacity: 0.75,
  },
  secondary: {
    marginTop: 16,
    alignSelf: "flex-start",
  },
  secondaryText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 16,
  },
  button: {
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
