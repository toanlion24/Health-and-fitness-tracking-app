import type { ReactElement } from "react";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import type { AuthStackScreenProps } from "../../../core/navigation/auth-types";
import { AuthHero } from "../components/auth-fields";
import { InputField } from "../components/input-field";
import { OnboardingLayout } from "../components/onboarding-layout";
import { OrDivider, SocialRow } from "../components/social-row";
import { PrimaryButton } from "../components/primary-button";
import { colors, layout, space, touch } from "../theme/tokens";
import { font } from "../theme/fonts";
import { useAuthStore } from "../../../core/store/auth-store";
import { ApiError } from "../../../core/lib/api";

type FieldErrors = {
  email?: string;
  password?: string;
  confirm?: string;
};

export function RegisterScreen({ navigation }: AuthStackScreenProps<"Register">): ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const onGooglePress = useCallback(() => {
    Alert.alert(
      "Google Sign-In",
      "Allow Health Fitness to access your Google account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Allow",
          onPress: async () => {
            setIsLoading(true);
            try {
              await useAuthStore.getState().loginWithGoogle("mock-google-token-12345");
              const needsOnboarding = useAuthStore.getState().needsOnboarding;
              if (needsOnboarding) {
                navigation.replace("OnboardingGender");
              } else {
                navigation.replace("MainTabs");
              }
            } catch (err: any) {
              console.error("Google login failed:", err);
              setToastMessage("Không thể kết nối máy chủ, vui lòng thử lại");
              setTimeout(() => setToastMessage(null), 3500);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  }, [navigation]);

  const onApplePress = useCallback(() => {
    Alert.alert(
      "Apple Sign-In",
      "Allow Health Fitness to access your Apple account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Allow",
          onPress: async () => {
            setIsLoading(true);
            try {
              await useAuthStore.getState().loginWithApple("mock-apple-token-12345");
              const needsOnboarding = useAuthStore.getState().needsOnboarding;
              if (needsOnboarding) {
                navigation.replace("OnboardingGender");
              } else {
                navigation.replace("MainTabs");
              }
            } catch (err: any) {
              console.error("Apple login failed:", err);
              setToastMessage("Không thể kết nối máy chủ, vui lòng thử lại");
              setTimeout(() => setToastMessage(null), 3500);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  }, [navigation]);

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
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        next.email = "Enter a valid email address.";
      }
    }
    if (!password) {
      next.password = "Enter a password.";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
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
      if ((err instanceof ApiError || err.name === "ApiError") && err.details?.fieldErrors) {
        const errors: FieldErrors = {};
        if (err.details.fieldErrors.email) {
          errors.email = Array.isArray(err.details.fieldErrors.email)
            ? err.details.fieldErrors.email.join(" ")
            : String(err.details.fieldErrors.email);
        }
        if (err.details.fieldErrors.password) {
          errors.password = Array.isArray(err.details.fieldErrors.password)
            ? err.details.fieldErrors.password.join(" ")
            : String(err.details.fieldErrors.password);
        }
        setFieldErrors(errors);
      } else {
        setFieldErrors({ email: err.message || "Đăng ký thất bại. Email có thể đã được sử dụng." });
      }
    } finally {
      setIsLoading(false);
    }
  }, [validate, email, password, navigation]);

  return (
    <OnboardingLayout
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

         <SocialRow onGoogle={onGooglePress} onApple={onApplePress} />
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
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </OnboardingLayout>
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
  toastContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: colors.slate900,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    shadowColor: colors.slate900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  toastText: {
    fontFamily: font.semibold,
    fontSize: 14,
    color: colors.white,
    textAlign: "center",
  },
});
