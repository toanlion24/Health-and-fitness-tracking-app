import { useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { AuthStackParamList } from "../../../core/navigation/types";

type Props = StackScreenProps<AuthStackParamList, "ResetPassword">;

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

const METHOD_OPTIONS = [
  { id: "email", title: "Send via Email", desc: "password via email address." },
  { id: "2fa", title: "Send via 2FA", desc: "password via 2 factors." },
  { id: "google", title: "Send via Google Auth", desc: "password via Google Auth." },
] as const;

type Method = (typeof METHOD_OPTIONS)[number]["id"];

export function ResetPasswordScreen({ navigation, route }: Props) {
  const [method, setMethod] = useState<Method>("email");
  const email = route.params?.email ?? "example@gmail.com";
  const [canvasW, setCanvasW] = useState(0);
  const [canvasH, setCanvasH] = useState(0);

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

  const frame = {
    width: frameWidth,
    height: frameHeight,
    left: frameLeft,
    top: frameTop,
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Image
        source={require("../../../../assets/auth-mock/sdfYD.png")}
        resizeMode="contain"
        style={[
          styles.mockImage,
          { width: frameWidth, height: frameHeight, left: frameLeft, top: frameTop },
        ]}
      />

      {canvasW > 0 && canvasH > 0 ? (
        <>
          <Pressable
            style={mapRect({ x: 16, y: 68, width: 48, height: 48 }, frame)}
            onPress={() => navigation.goBack()}
          />

          <Pressable
            style={mapRect({ x: 16, y: 218, width: 343, height: 97 }, frame)}
            onPress={() => setMethod("email")}
          />
          <Pressable
            style={mapRect({ x: 16, y: 324, width: 343, height: 97 }, frame)}
            onPress={() => setMethod("2fa")}
          />
          <Pressable
            style={mapRect({ x: 16, y: 430, width: 343, height: 97 }, frame)}
            onPress={() => setMethod("google")}
          />

          <Pressable
            style={mapRect({ x: 16, y: 565, width: 343, height: 56 }, frame)}
            onPress={() =>
              navigation.navigate("PasswordSent", {
                email,
              })
            }
          />

          <View
            pointerEvents="none"
            style={[
              styles.activeMark,
              method === "email"
                ? mapRect({ x: 20, y: 223, width: 335, height: 87 }, frame)
                : method === "2fa"
                  ? mapRect({ x: 20, y: 329, width: 335, height: 87 }, frame)
                  : mapRect({ x: 20, y: 435, width: 335, height: 87 }, frame),
            ]}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  mockImage: {
    position: "absolute",
  },
  activeMark: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#f9731688",
  },
});
