import { useState } from "react";
import {
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  ViewStyle,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import { useAuthStore } from "../../../core/store/auth-store";
import type { AuthStackParamList } from "../../../core/navigation/types";

type Props = StackScreenProps<AuthStackParamList, "Login">;

const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

type Rect = { x: number; y: number; width: number; height: number };

function mapRect(
  rect: Rect,
  frame: { width: number; height: number; left: number; top: number },
): StyleProp<ViewStyle> {
  return {
    position: "absolute",
    left: frame.left + (rect.x / DESIGN_WIDTH) * frame.width,
    top: frame.top + (rect.y / DESIGN_HEIGHT) * frame.height,
    width: (rect.width / DESIGN_WIDTH) * frame.width,
    height: (rect.height / DESIGN_HEIGHT) * frame.height,
  };
}

export function LoginScreen({ navigation }: Props) {
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const errorMessage = useAuthStore((s) => s.errorMessage);

  const [email, setEmail] = useState("elementary221b@gmail.com");
  const [password, setPassword] = useState("password123");
  const [canvasW, setCanvasW] = useState(0);
  const [canvasH, setCanvasH] = useState(0);

  const busy = status === "loading";
  const frameRatio = DESIGN_WIDTH / DESIGN_HEIGHT;
  const canvasRatio = canvasH > 0 ? canvasW / canvasH : frameRatio;
  const frameWidth = canvasRatio > frameRatio ? canvasH * frameRatio : canvasW;
  const frameHeight = canvasRatio > frameRatio ? canvasH : canvasW / frameRatio;
  const frameLeft = (canvasW - frameWidth) / 2;
  const frameTop = (canvasH - frameHeight) / 2;

  const onLayout = (event: LayoutChangeEvent) => {
    setCanvasW(event.nativeEvent.layout.width);
    setCanvasH(event.nativeEvent.layout.height);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.canvas} onLayout={onLayout}>
        <Image
          source={require("../../../../assets/auth-mock/18Bql.png")}
          resizeMode="contain"
          style={[
            styles.mockImage,
            { width: frameWidth, height: frameHeight, left: frameLeft, top: frameTop },
          ]}
        />

        {canvasW > 0 && canvasH > 0 ? (
          <>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={[
                styles.overlayInput,
                mapRect(
                  { x: 52, y: 370, width: 270, height: 24 },
                  { width: frameWidth, height: frameHeight, left: frameLeft, top: frameTop },
                ),
              ]}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[
                styles.overlayInput,
                mapRect(
                  { x: 52, y: 460, width: 245, height: 24 },
                  { width: frameWidth, height: frameHeight, left: frameLeft, top: frameTop },
                ),
              ]}
            />

            <Pressable
              style={mapRect(
                { x: 16, y: 514, width: 343, height: 56 },
                { width: frameWidth, height: frameHeight, left: frameLeft, top: frameTop },
              )}
              disabled={busy}
              onPress={() => {
                void login(email.trim(), password);
              }}
            />
            <Pressable
              style={mapRect(
                { x: 100, y: 730, width: 180, height: 20 },
                { width: frameWidth, height: frameHeight, left: frameLeft, top: frameTop },
              )}
              disabled={busy}
              onPress={() => navigation.navigate("Register")}
            />
            <Pressable
              style={mapRect(
                { x: 132, y: 750, width: 120, height: 20 },
                { width: frameWidth, height: frameHeight, left: frameLeft, top: frameTop },
              )}
              disabled={busy}
              onPress={() =>
                navigation.navigate("ResetPassword", {
                  email: email.trim() === "" ? undefined : email.trim(),
                })
              }
            />

            {errorMessage ? (
              <View
                style={mapRect(
                  { x: 24, y: 286, width: 327, height: 22 },
                  { width: frameWidth, height: frameHeight, left: frameLeft, top: frameTop },
                )}
              >
                <Text numberOfLines={1} style={styles.errorInline}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  canvas: {
    flex: 1,
  },
  mockImage: {
    position: "absolute",
  },
  overlayInput: {
    fontSize: 16,
    color: "#111214",
    fontWeight: "500",
    padding: 0,
  },
  errorInline: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
