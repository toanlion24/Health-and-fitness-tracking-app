import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, touch } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { NutritionStackScreenProps } from "../navigation/nutrition-stack-types";

export function NutritionBarcodeScreen({ navigation }: NutritionStackScreenProps<"BarcodeScan">): ReactElement {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  
  const [torch, setTorch] = useState(false); 

  // Trạng thái 1: Chờ load quyền
  if (!permission) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0F172A", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.emerald600} size="large" />
      </View>
    );
  }

  // Trạng thái 2: Xin quyền Camera nếu chưa có
  if (!permission.granted) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0F172A", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <MaterialCommunityIcons name="camera-off" size={64} color={colors.slate400} />
        <Text style={{ fontFamily: font.extrabold, fontSize: 20, color: colors.white, marginTop: 16 }}>
          Camera Access Needed
        </Text>
        <Text style={{ fontFamily: font.medium, fontSize: 14, color: colors.slate400, textAlign: "center", marginTop: 8 }}>
          We need your permission to scan food barcodes.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{ marginTop: 24, backgroundColor: colors.emerald600, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 16, color: colors.white }}>Grant Permission</Text>
        </Pressable>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16, padding: 8 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 14, color: colors.slate400 }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Xử lý khi quét trúng mã vạch
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    // Giả lập delay 0.5s xử lý data rồi nhảy sang màn chi tiết
    setTimeout(() => {
      navigation.replace("FoodDetail", { foodId: "apple" });
    }, 500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.slate900 }}>
      <StatusBar style="light" />

      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch} // Liên kết với state của nút đèn pin
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
      />

      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(15,23,42,0.7)" }]} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right", "bottom"]}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          
          {/* Header */}
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
                backgroundColor: "rgba(0,0,0,0.3)", // Thêm tí nền đen mờ cho nút
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

          {/* Khung ngắm */}
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20 }}>
            <View
              style={{
                width: "88%",
                aspectRatio: 1,
                maxWidth: 320,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: scanned ? colors.emerald600 : "rgba(52,211,153,0.6)",
                backgroundColor: "transparent", 
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons 
                name="barcode-scan" 
                size={64} 
                color={scanned ? colors.emerald600 : "rgba(255,255,255,0.35)"} 
              />
              <Text style={{ fontFamily: font.medium, fontSize: 14, color: scanned ? colors.emerald600 : "rgba(255,255,255,0.5)", marginTop: 16, textAlign: "center" }}>
                {scanned ? "Processing barcode..." : "Align barcode within frame"}
              </Text>
            </View>
          </View>

          {/* Nút Flashlight */}
          <View style={{ paddingBottom: 28, alignItems: "center" }}>
            <Pressable
              onPress={() => setTorch(!torch)}
              accessibilityRole="button"
              accessibilityLabel="Torch"
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: torch ? colors.white : "rgba(255,255,255,0.12)",
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: "rgba(255,255,255,0.25)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons 
                // Đổi icon khi bấm
                name={torch ? "flashlight-off" : "flashlight"} 
                size={28} 
                color={torch ? colors.slate900 : colors.white} 
              />
            </Pressable>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}