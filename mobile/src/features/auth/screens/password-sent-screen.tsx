import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { AuthStackParamList } from "../../../core/navigation/types";

type Props = StackScreenProps<AuthStackParamList, "PasswordSent">;

export function PasswordSentScreen({ navigation, route }: Props) {
  const email = route.params.email;

  return (
    <ImageBackground
      source={require("../../../../assets/SigninSignUp/Frame (1).png")}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.checkBadge}>
            <Image
              source={require("../../../../assets/SigninSignUp/2.png")}
              resizeMode="contain"
              style={styles.checkImage}
            />
          </View>

          <Text style={styles.title}>Password Sent!</Text>
          <Text style={styles.subtitle}>{"We've sent the password to\n"}{email}</Text>

          <Pressable
            style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
            onPress={() => navigation.replace("ResetPassword", { email })}
          >
            <Text style={styles.primaryText}>Re-Send Password</Text>
          </Pressable>
        </View>

        <Pressable style={styles.close} onPress={() => navigation.replace("Login")}>
          <Text style={styles.closeText}>x</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.28)",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 18,
  },
  card: {
    width: "100%",
    borderRadius: 28,
    backgroundColor: "#ffffff",
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  checkBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#ecfccb",
    alignItems: "center",
    justifyContent: "center",
  },
  checkImage: {
    width: 28,
    height: 28,
  },
  title: {
    marginTop: 18,
    fontSize: 42,
    fontWeight: "900",
    color: "#020617",
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 17,
    lineHeight: 25,
    color: "#475569",
    textAlign: "center",
  },
  primary: {
    marginTop: 20,
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  primaryPressed: {
    opacity: 0.9,
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "800",
  },
  close: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 28,
    color: "#020617",
    fontWeight: "600",
  },
});
