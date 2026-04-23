import { useEffect } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { AuthStackParamList } from "../../../core/navigation/types";

type Props = StackScreenProps<AuthStackParamList, "Splash">;

const SPLASH_DURATION_MS = 1400;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Welcome");
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      source={require("../../../../assets/SplashScreen/Rectangle 1.png")}
      resizeMode="cover"
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoMark}>
          <Text style={styles.logoGlyph}>U</Text>
        </View>
        <Text style={styles.brand}>Uplift.ai</Text>
        <Text style={styles.tagline}>Your personal AI fitness coach.</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 140,
    backgroundColor: "#f97316",
  },
  content: {
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlyph: {
    color: "#ffffff",
    fontSize: 60,
    fontWeight: "900",
    letterSpacing: -2,
  },
  brand: {
    fontSize: 42,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.8,
    marginTop: 8,
  },
  tagline: {
    fontSize: 19,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
  },
});
