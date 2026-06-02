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
import { fetchApi } from "../../../core/lib/api";

type ChatLine = { id: string; role: "user" | "assistant"; text: string };

export function NotificationsAiCoachScreen({
  navigation,
  route,
}: ProfileStackScreenProps<"NotificationsAiCoach">): ReactElement {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);
  const appliedInitialRef = useRef(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [lines, setLines] = useState<ChatLine[]>([
    {
      id: "a0",
      role: "assistant",
      text: t("notifications.coachDemoReply"),
    },
  ]);

  // Unified send message function
  const sendMessage = async (messageText: string): Promise<void> => {
    const trimmed = messageText.trim();
    if (!trimmed) {
      return;
    }

    const userLine: ChatLine = {
      id: `u-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    // Update messages local list & set loading states
    setLines((prev) => [...prev, userLine]);
    setLoading(true);
    setError(null);
    setInput("");

    // Scroll to end after inserting user bubble
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

    try {
      // Package conversation history for DTO payload
      const history = [...lines, userLine].map((l) => ({
        role: l.role,
        content: l.text,
      }));

      const res = await fetchApi("/coach/chat", {
        method: "POST",
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        throw new Error("Chat api call failed");
      }

      const data = await res.json();
      
      const assistantLine: ChatLine = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: data.reply || "Sorry, I received an empty response. Please try again.",
      };

      setLines((prev) => [...prev, assistantLine]);
    } catch (err) {
      console.error("AI Coach Chatbot Error:", err);
      setError("I was unable to connect to the AI Coach server. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  // Auto-send when an initial prompt message comes from Home FAB Sheet
  useEffect(() => {
    if (appliedInitialRef.current) {
      return;
    }
    const initialMsg = route.params?.initialMessage?.trim();
    if (!initialMsg) {
      return;
    }
    appliedInitialRef.current = true;
    sendMessage(initialMsg);
  }, [route.params]);

  const onSendPress = (): void => {
    sendMessage(input);
  };

  const applySuggestedPrompt = (text: string): void => {
    setInput(text);
  };

  // Helper: Parses double asterisks for inline bolding
  const parseBoldText = (text: string, baseStyle: any, boldStyle: any): ReactElement => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return (
      <Text style={baseStyle}>
        {parts.map((part, index) => {
          const isBold = index % 2 === 1;
          return (
            <Text key={index} style={isBold ? boldStyle : baseStyle}>
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  // Custom visual Markdown renderer for chatbot response bubbles
  const renderFormattedText = (text: string): ReactElement => {
    const rawLines = text.split("\n");
    return (
      <View style={{ gap: 6 }}>
        {rawLines.map((line, lineIndex) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <View key={lineIndex} style={{ height: 4 }} />;
          }

          // 1. Header Rendering (### header or ## header)
          if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
            const headerText = trimmed.replace(/^(###|##)\s*/, "");
            return (
              <View key={lineIndex} style={{ marginTop: 8, marginBottom: 2 }}>
                {parseBoldText(
                  headerText,
                  { fontFamily: font.extrabold, fontSize: 15, color: colors.slate900 },
                  { fontFamily: font.extrabold, fontSize: 15, color: colors.emerald600 }
                )}
              </View>
            );
          }

          // 2. Bullet List Rendering (- item or * item)
          if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
            const bulletText = trimmed.replace(/^[-*]\s*/, "");
            return (
              <View key={lineIndex} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, paddingLeft: 4 }}>
                <Text style={{ fontSize: 13, color: "#0284C7", marginTop: 1 }}>•</Text>
                <View style={{ flex: 1 }}>
                  {parseBoldText(
                    bulletText,
                    { fontFamily: font.semibold, fontSize: 13, color: colors.slate700, lineHeight: 18 },
                    { fontFamily: font.extrabold, fontSize: 13, color: colors.slate900, lineHeight: 18 }
                  )}
                </View>
              </View>
            );
          }

          // 3. Normal Paragraph
          return (
            <View key={lineIndex}>
              {parseBoldText(
                trimmed,
                { fontFamily: font.semibold, fontSize: 13, color: colors.slate700, lineHeight: 18 },
                { fontFamily: font.extrabold, fontSize: 13, color: colors.slate900, lineHeight: 18 }
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Module01Layout variant="onboardingBlue" contentInset={[8, 20, 12, 20]} scrollable={false}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? layout.iosTopAir + 8 : 0}
      >
        <View style={{ flex: 1, gap: 12 }}>
          {/* Header row */}
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

          {/* Messages Scroll Area */}
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          >
            <View style={{ gap: 10, paddingBottom: 16 }}>
              {lines.map((line) =>
                line.role === "user" ? (
                  <View key={line.id} style={{ alignSelf: "flex-end", maxWidth: "85%" }}>
                    <LinearGradient
                      colors={["#059669", "#0284C7"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12 }}
                    >
                      <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.white, lineHeight: 18 }}>
                        {line.text}
                      </Text>
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
                    {renderFormattedText(line.text)}
                  </View>
                )
              )}

              {/* Dynamic typing loaders */}
              {loading && <TypingIndicator />}

              {/* Error/Resilience feedback card */}
              {error && (
                <View
                  style={{
                    borderRadius: radii.card,
                    padding: 12,
                    gap: 8,
                    backgroundColor: "#FEF2F2",
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: "#FCA5A5",
                    marginVertical: 4,
                  }}
                >
                  <Text style={{ fontFamily: font.semibold, fontSize: 12, color: "#991B1B", lineHeight: 16 }}>
                    {error}
                  </Text>
                  <Pressable
                    onPress={() => {
                      const lastUser = [...lines].reverse().find((l) => l.role === "user");
                      if (lastUser) {
                        setLines((prev) => prev.filter((l) => l.id !== lastUser.id));
                        sendMessage(lastUser.text);
                      }
                    }}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: radii.pill,
                      backgroundColor: "#EF4444",
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.white }}>
                      Retry Message
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Quick suggested chips block */}
            <View
              style={{
                borderRadius: radii.card,
                padding: 12,
                gap: 8,
                backgroundColor: colors.slate100,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontFamily: font.extrabold, fontSize: 11, color: colors.slate500 }}>
                {t("notifications.aiSuggested")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <Chip
                  text={t("notifications.promptMeal")}
                  onPress={() => applySuggestedPrompt(t("notifications.promptMeal"))}
                />
                <Chip
                  text={t("notifications.promptWater")}
                  onPress={() => applySuggestedPrompt(t("notifications.promptWater"))}
                />
                <Chip
                  text={t("notifications.promptSleep")}
                  onPress={() => applySuggestedPrompt(t("notifications.promptSleep"))}
                />
              </View>
            </View>
          </ScrollView>

          {/* Text input controller */}
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
              marginBottom: Platform.OS === "android" ? 10 : 4,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t("notifications.aiPlaceholder")}
              placeholderTextColor={colors.slate400}
              editable={!loading}
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
              onSubmitEditing={onSendPress}
            />
            <Pressable
              onPress={onSendPress}
              disabled={loading || !input.trim()}
              accessibilityRole="button"
              accessibilityLabel={t("notifications.aiSend")}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                overflow: "hidden",
                opacity: !input.trim() || loading ? 0.45 : 1,
              }}
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

// Bouncing animated dots typing simulator
function TypingIndicator(): ReactElement {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 450);
    return () => clearInterval(timer);
  }, []);

  return (
    <View
      style={{
        alignSelf: "flex-start",
        maxWidth: "85%",
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: colors.white,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.slate200,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#059669" }} />
      <Text style={{ fontFamily: font.semibold, fontSize: 13, color: colors.slate500 }}>
        AI Coach is typing{dots}
      </Text>
    </View>
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
