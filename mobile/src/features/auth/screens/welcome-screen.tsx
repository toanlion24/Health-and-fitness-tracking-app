import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { AuthStackParamList } from "../../../core/navigation/types";

type Props = StackScreenProps<AuthStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ImageBackground
      source={require("../../../../assets/welcomeScreen/Rectangle 1.png")}
      resizeMode="cover"
      style={styles.container}
    >
      <Image
        source={require("../../../../assets/welcomeScreen/illustration fitness equipments design background.png")}
        resizeMode="cover"
        style={styles.heroImage}
      />
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>U</Text>
          </View>
          <Text style={styles.title}>Welcome To{"\n"}Uplift.ai</Text>
          <Text style={styles.subtitle}>Your personal fitness AI Assistant</Text>

          <Pressable
            style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.primaryText}>{"Get Started ->"}</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Already have account? Sign In</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.44)",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 52,
  },
  content: {
    alignItems: "center",
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.42)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
    marginTop: -3,
  },
  title: {
    fontSize: 46,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 20,
    color: "#f8fafc",
    textAlign: "center",
  },
  primary: {
    marginTop: 34,
    width: "100%",
    borderRadius: 20,
    backgroundColor: "#f97316",
    paddingVertical: 20,
    alignItems: "center",
  },
  primaryPressed: {
    opacity: 0.9,
  },
  primaryText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  link: {
    marginTop: 20,
    fontSize: 18,
    color: "#f8fafc",
    fontWeight: "600",
  },
});
