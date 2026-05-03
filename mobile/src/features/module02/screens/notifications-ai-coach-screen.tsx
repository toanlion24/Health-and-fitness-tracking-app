import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Module01Layout } from "../../module01/components/module01-layout";
import { colors, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";

type ChatLine = { id: string; role: "user" | "assistant"; text: string };

export function NotificationsAiCoachScreen({
  navigation,
  route,
}: ProfileStackScreenProps<"NotificationsAiCoach">): ReactElement {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const appliedInitialRef = useRef(false);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<ChatLine[]>([
    {
      id: "a0",
      role: "assistant",
      text: t("notifications.coachDemoReply"),
    },
  ]);

  useEffect(() => {
    if (appliedInitialRef.current) {
      return;
    }
    const trimmed = route.params?.initialMessage?.trim();
    if (!trimmed) {
      return;
    }
    appliedInitialRef.current = true;
    const userLine: ChatLine = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    const reply: ChatLine = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: t("notifications.coachDemoReply"),
    };
    setLines((prev) => [...prev, userLine, reply]);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, [route.params, t]);

  const send = (): void => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }
    const userLine: ChatLine = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    const reply: ChatLine = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: t("notifications.coachDemoReply"),
    };
    setLines((prev) => [...prev, userLine, reply]);
    setInput("");
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const prompt = (text: string): void => {
    setInput(text);
  };

  return (
    <Module01Layout variant="onboardingBlue" contentInset={[8, 20, 12, 20]} scrollable={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? layout.iosTopAir + 8 : 0}
      >
        <View style={{ flex: 1, gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel={t("a11y.goBack")}
              hitSlop={12}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
            </Pressable>
            <Text style={{ flex: 1, fontFamily: font.extrabold, fontSize: 24, color: colors.slate900 }}>
              {t("notifications.aiTitle")}
            </Text>
          </View>

          <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardDismissMode="interactive">
            <View style={{ gap: 10, paddingBottom: 12 }}>
              {lines.map((line) =>
                line.role === "user" ? (
                  <View key={line.id} style={{ alignSelf: "flex-end", maxWidth: "85%" }}>
                    <LinearGradient
                      colors={["#059669", "#0284C7"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12 }}
                    >
                      <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.white, lineHeight: 18 }}>{line.text}</Text>
                    </LinearGradient>
                  </View>
                ) : (
                  <View
                    key={line.id}
                    style={{
                      alignSelf: "flex-start",
                      maxWidth: "85%",
                      borderRadius: 16,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      backgroundColor: colors.white,
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: colors.slate200,
                    }}
                  >
                    <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate700, lineHeight: 18 }}>{line.text}</Text>
                  </View>
                )
              )}
            </View>

            <View
              style={{
                borderRadius: radii.card,
                padding: 12,
                gap: 8,
                backgroundColor: colors.slate100,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontFamily: font.extrabold, fontSize: 11, color: colors.slate500 }}>{t("notifications.aiSuggested")}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <Chip text={t("notifications.promptMeal")} onPress={() => prompt(t("notifications.promptMeal"))} />
                <Chip text={t("notifications.promptWater")} onPress={() => prompt(t("notifications.promptWater"))} />
                <Chip text={t("notifications.promptSleep")} onPress={() => prompt(t("notifications.promptSleep"))} />
              </View>
            </View>
          </ScrollView>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              borderRadius: radii.card,
              paddingLeft: 12,
              paddingRight: 8,
              paddingVertical: 8,
              backgroundColor: colors.white,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: colors.slate200,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t("notifications.aiPlaceholder")}
              placeholderTextColor={colors.slate400}
              style={{
                flex: 1,
                fontFamily: font.semibold,
                fontSize: 13,
                color: colors.slate900,
                minHeight: 36,
                paddingVertical: 4,
              }}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={send}
            />
            <Pressable
              onPress={send}
              accessibilityRole="button"
              accessibilityLabel={t("notifications.aiSend")}
              style={{ width: 34, height: 34, borderRadius: 10, overflow: "hidden" }}
            >
              <LinearGradient
                colors={["#059669", "#0284C7"]}
                style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
              >
                <MaterialCommunityIcons name="send" size={16} color={colors.white} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Module01Layout>
  );
}

function Chip(props: { text: string; onPress: () => void }): ReactElement {
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: radii.pill,
          backgroundColor: colors.white,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.slate200,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate700 }} numberOfLines={2}>
        {props.text}
      </Text>
    </Pressable>
  );
}
