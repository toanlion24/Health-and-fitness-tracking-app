import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { colors, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { NutritionStackScreenProps } from "../navigation/nutrition-stack-types";

export function NutritionBarcodeScreen({ navigation }: NutritionStackScreenProps<"BarcodeScan">): ReactElement {
  return (
    <LinearGradient colors={["#0F172A", "#1E293B", "#0F172A"]} style={{ flex: 1 }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right", "bottom"]}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 8 }}>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Close scanner"
              style={{
                width: touch.min,
                height: touch.min,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.white} />
            </Pressable>
            <Text style={{ flex: 1, textAlign: "center", fontFamily: font.bold, fontSize: 17, color: colors.white, marginRight: touch.min }}>
              Scan barcode
            </Text>
          </View>

          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20 }}>
            <View
              style={{
                width: "88%",
                aspectRatio: 1,
                maxWidth: 320,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: "rgba(52,211,153,0.6)",
                backgroundColor: "rgba(15,23,42,0.5)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="barcode-scan" size={64} color="rgba(255,255,255,0.35)" />
              <Text style={{ fontFamily: font.medium, fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 16, textAlign: "center" }}>
                Align barcode within frame
              </Text>
            </View>
            <Text style={{ fontFamily: font.medium, fontSize: 14, color: "rgba(255,255,255,0.65)", textAlign: "center", paddingHorizontal: 24 }}>
              Demo mode: camera hooks ship with product barcode lookup in a later iteration.
            </Text>
          </View>

          <View style={{ paddingBottom: 28, alignItems: "center" }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Torch"
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: "rgba(255,255,255,0.12)",
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: "rgba(255,255,255,0.25)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="flashlight" size={28} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
