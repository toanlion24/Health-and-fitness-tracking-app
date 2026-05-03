import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, gradients, layout, radii, space } from "../theme/tokens";
import { font } from "../theme/fonts";

type AuthHeroProps = {
  title: string;
  subtitle: string;
  /** Center glyph inside the gradient logo circle (MaterialCommunityIcons). */
  logoIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
};

export function AuthHero({ title, subtitle, logoIcon = "run" }: AuthHeroProps): ReactElement {
  const logoSize = layout.authLogoSize;
  return (
    <View
      style={styles.wrap}
      accessibilityRole="header"
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <LinearGradient
        colors={[...gradients.logoCircle]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.logoShadow,
          {
            width: logoSize,
            height: logoSize,
            borderRadius: radii.logo,
          },
        ]}
      >
        <MaterialCommunityIcons name={logoIcon} size={Math.round(logoSize * 0.5)} color={colors.white} importantForAccessibility="no" />
      </LinearGradient>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    alignItems: "center",
    gap: space.s2,
    paddingBottom: space.s1,
  },
  logoShadow: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0D9488",
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  title: {
    fontFamily: font.bold,
    fontSize: 28,
    letterSpacing: -0.6,
    color: colors.slate900,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate500,
    textAlign: "center",
    maxWidth: layout.authHeroMaxCopyWidth,
    width: "100%",
    paddingHorizontal: space.s1,
  },
});
