import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Module01StackScreenProps } from "../../../core/navigation/module01-types";
import { AuthHero } from "../components/auth-fields";
import { InputField } from "../components/input-field";
import { Module01Layout } from "../components/module01-layout";
import { OrDivider, SocialRow } from "../components/social-row";
import { PrimaryButton } from "../components/primary-button";
import { colors, layout, space, touch } from "../theme/tokens";
import { font } from "../theme/fonts";
import { useAuthStore } from "../../../core/store/auth-store";

type FieldErrors = {
  email?: string;
  password?: string;
  confirm?: string;
};

export function RegisterScreen({ navigation }: Module01StackScreenProps<"Register">): ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);

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
  const onChangePassword = useCallback(
    (t: string) => {
      setPassword(t);
      clearError("password");
      clearError("confirm");
    },
    [clearError],
  );
  const onChangeConfirm = useCallback(
    (t: string) => {
      setConfirm(t);
      clearError("confirm");
    },
    [clearError],
  );

  const validate = useCallback((): boolean => {
    const next: FieldErrors = {};
    const trimmed = email.trim();
    if (!trimmed) {
      next.email = "Enter your email address.";
    }
    if (!password) {
      next.password = "Enter a password.";
    }
    if (!confirm) {
      next.confirm = "Confirm your password.";
    } else if (password !== confirm) {
      next.confirm = "Password confirmation does not match.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }, [email, password, confirm]);

  const onSubmit = useCallback(async () => {
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const trimmed = email.trim();
      await useAuthStore.getState().register(trimmed, password);
      navigation.replace("OnboardingGender");
    } catch (err: any) {
      setFieldErrors({ email: err.message || "Đăng ký thất bại. Email có thể đã được sử dụng." });
    } finally {
      setIsLoading(false);
    }
  }, [validate, email, password, navigation]);

  return (
    <Module01Layout
      variant="auth"
      contentInset={layout.contentPadAuth}
      keyboardAvoiding
      scrollable
    >
      <View style={styles.column}>
        <AuthHero
          title="Create account"
          subtitle="Track workouts, meals, and progress in one place."
        />

        <View style={styles.formStack}>
          <InputField
            label="Email"
            icon="email-outline"
            value={email}
            onChangeText={onChangeEmail}
            placeholder="you@email.com"
            error={fieldErrors.email}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            testID="register-email"
          />
          <InputField
            label="Password"
            icon="lock-outline"
            value={password}
            onChangeText={onChangePassword}
            placeholder="••••••••"
            error={fieldErrors.password}
            secure
            autoComplete="password"
            textContentType="password"
            returnKeyType="next"
            testID="register-password"
          />
          <InputField
            label="Confirm password"
            icon="shield-check"
            value={confirm}
            onChangeText={onChangeConfirm}
            placeholder="••••••••"
            error={fieldErrors.confirm}
            secure
            autoComplete="password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            testID="register-confirm"
          />
        </View>

        <PrimaryButton
          label={isLoading ? "Signing up..." : "Sign up"}
          onPress={onSubmit}
          disabled={isLoading}
          testID="register-submit"
        />

        <OrDivider />

        <SocialRow />

        <View style={styles.footerRow}>
          <Text style={styles.footerMuted} accessibilityRole="text">
            Already have an account?
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Login")}
            accessibilityRole="link"
            accessibilityLabel="Sign in"
            style={styles.footerLinkHit}
          >
            <Text style={styles.footerLink}>Sign in</Text>
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
