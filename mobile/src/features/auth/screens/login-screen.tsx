import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import { useAuthStore } from "../../../core/store/auth-store";
import type { AuthStackParamList } from "../../../core/navigation/types";

type Props = StackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const errorMessage = useAuthStore((s) => s.errorMessage);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const busy = status === "loading";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Sign in</Text>

      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}

      <TextInput
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={[styles.primary, busy && styles.disabled]}
        disabled={busy}
        onPress={() => {
          void login(email.trim(), password);
        }}
      >
        <Text style={styles.primaryText}>{busy ? "Signing in..." : "Sign in"}</Text>
      </Pressable>

      <Pressable
        style={styles.secondary}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.secondaryText}>Create an account</Text>
      </Pressable>
    </KeyboardAvoidingView>
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
    marginBottom: 16,
  },
  error: {
    color: "#b91c1c",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  primary: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondary: {
    marginTop: 14,
    alignItems: "center",
  },
  secondaryText: {
    color: "#2563eb",
    fontWeight: "600",
  },
});
