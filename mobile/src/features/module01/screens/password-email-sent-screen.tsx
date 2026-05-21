import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import type { Module01StackParamList } from "../../../core/navigation/module01-types";
import type { Module01StackScreenProps } from "../../../core/navigation/module01-types";
import { AuthHero } from "../components/auth-fields";

type PasswordEmailSentRouteProp = {
  key: string;
  name: "PasswordEmailSent";
  params: Module01StackParamList["PasswordEmailSent"];
};
import { GradientPrimaryButton } from "../components/gradient-primary-button";
import { Module01Layout } from "../components/module01-layout";
import { colors, layout, radii, space, touch } from "../theme/tokens";
import { font } from "../theme/fonts";

export function PasswordEmailSentScreen({
  navigation,
}: Module01StackScreenProps<"PasswordEmailSent">): ReactElement {
  const route = useRoute<PasswordEmailSentRouteProp>();
  const sentTo = route.params?.email;

  const onResend = (): void => {
    navigation.navigate(
      "ForgotPassword",
      sentTo != null && sentTo.length > 0 ? { prefilledEmail: sentTo } : undefined,
    );
  };

  return (
    <Module01Layout variant="auth" contentInset={layout.contentPadAuth} scrollable>
      <View style={styles.column}>
        <AuthHero
          logoIcon="email-check"
          title="Check your email"
          subtitle="We sent a password reset link to the address you entered. Open the email and tap the link to choose a new password. If you don't see it, check spam or promotions."
        />
        <View style={styles.tipCard} accessibilityRole="text">
          <MaterialCommunityIcons name="information" size={20} color={colors.cyan600} style={styles.tipIcon} />
          <Text style={styles.tipText}>
            The reset link expires after a short time for security. You can request a new one anytime.
          </Text>
        </View>
        <GradientPrimaryButton
          label="Back to sign in"
          onPress={() => navigation.navigate("Login")}
          testID="password-email-sent-back"
        />
        <View style={styles.footerRow}>
          <Text style={styles.footerMuted}>Didn't get the email?</Text>
          <Pressable
            onPress={onResend}
            accessibilityRole="link"
            accessibilityLabel="Resend link"
            style={styles.footerLinkHit}
          >
            <Text style={styles.footerLink}>Resend link</Text>
          </Pressable>
        </View>
      </View>
    </Module01Layout>
  );
}

const styles = StyleSheet.create({
  column: {
    width: "100%",
    flexGrow: 1,
    gap: space.s3,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.s2,
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: space.s2,
    borderRadius: radii.cardMd,
    borderWidth: 1,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
  },
  tipIcon: {
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.slate600,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: space.s1,
    paddingTop: space.s2,
    minHeight: touch.min,
    paddingBottom: space.s2,
  },
  footerMuted: {
    fontFamily: font.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.slate500,
  },
  footerLinkHit: {
    minHeight: touch.min,
    justifyContent: "center",
    paddingHorizontal: space.s1,
  },
  footerLink: {
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.cyan600,
  },
});
