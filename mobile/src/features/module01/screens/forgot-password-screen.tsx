import type { ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RouteProp } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import type { Module01StackParamList } from "../../../core/navigation/module01-types";
import type { Module01StackScreenProps } from "../../../core/navigation/module01-types";
import { AuthHero } from "../components/auth-fields";
import { InputField } from "../components/input-field";
import { GradientPrimaryButton } from "../components/gradient-primary-button";
import { Module01Layout } from "../components/module01-layout";
import { colors, layout, space, touch } from "../theme/tokens";
import { font } from "../theme/fonts";

type FieldErrors = {
  email?: string;
};

export function ForgotPasswordScreen({
  navigation,
}: Module01StackScreenProps<"ForgotPassword">): ReactElement {
  const route = useRoute<RouteProp<Module01StackParamList, "ForgotPassword">>();
  const [email, setEmail] = useState(route.params?.prefilledEmail ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    const p = route.params?.prefilledEmail;
    if (p != null && p.length > 0) {
      setEmail(p);
    }
  }, [route.params?.prefilledEmail]);

  const clearError = useCallback((key: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (prev[key] == null) {
        return prev;
      }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const onChangeEmail = useCallback(
    (t: string) => {
      setEmail(t);
      clearError("email");
    },
    [clearError],
  );

  const onSend = useCallback(() => {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldErrors({ email: "Enter your email address." });
      return;
    }
    setFieldErrors({});
    navigation.navigate("PasswordEmailSent", { email: trimmed });
  }, [email, navigation]);

  return (
    <Module01Layout variant="auth" contentInset={layout.contentPadAuth} keyboardAvoiding scrollable>
      <View style={styles.column}>
        <AuthHero
          title="Forgot password?"
          subtitle="Enter your email address and we will send you a link to reset your password."
        />
        <View style={styles.formStack}>
          <InputField
            label="Email"
            icon="email-outline"
            value={email}
            onChangeText={onChangeEmail}
            placeholder="you@email.com"
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={onSend}
            error={fieldErrors.email}
            testID="forgot-password-email"
          />
        </View>
        <GradientPrimaryButton label="Send reset link" onPress={onSend} testID="forgot-password-submit" />
        <View style={styles.footerRow}>
          <Text style={styles.footerMuted}>Remember your password?</Text>
          <Pressable
            onPress={() => navigation.navigate("Login")}
            accessibilityRole="link"
            accessibilityLabel="Back to sign in"
            style={styles.footerLinkHit}
          >
            <Text style={styles.footerLink}>Back to sign in</Text>
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
  formStack: {
    width: "100%",
    gap: space.s3,
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
