import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { NavigationProp, ParamListBase } from "@react-navigation/native";
import type { ReactElement } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { navigateMainTab } from "../../../core/navigation/navigate-main-tab";
import { colors, radii, touch } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";

type HomeCoachFabSheetProps = {
  navigation: NavigationProp<ParamListBase>;
  /** Parent lifts visibility when quick-action row opens coach too */
  visible: boolean;
  onClose: () => void;
  onOpen: () => void;
};

export function HomeCoachFabSheet(props: HomeCoachFabSheetProps): ReactElement {
  const { navigation, visible, onClose, onOpen } = props;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");

  const goFullChat = (initialMessage?: string): void => {
    const trimmed = initialMessage?.trim() ?? draft.trim();
    onClose();
    setDraft("");
    navigateMainTab(navigation, "Profile", {
      screen: "NotificationsAiCoach",
      params: trimmed.length > 0 ? { initialMessage: trimmed } : undefined,
    });
  };

  const applyPrompt = (text: string): void => {
    setDraft(text);
  };

  return (
    <>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={t("home.coachFabA11y")}
        style={[
          styles.fab,
          {
            bottom: Math.max(insets.bottom, 12) + 8,
            right: Math.max(insets.right, 16),
          },
        ]}
      >
        <LinearGradient colors={["#059669", "#0284C7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabInner}>
          <MaterialCommunityIcons name="robot-outline" size={26} color={colors.white} />
        </LinearGradient>
      </Pressable>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalRoot}
        >
          <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel={t("a11y.closeSheet")} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{t("home.coachSheetTitle")}</Text>
            <Text style={styles.sheetSub}>{t("home.coachSheetSub")}</Text>

            <View style={styles.promptRow}>
              <Pressable
                onPress={() => applyPrompt(t("home.coachPrompt1"))}
                style={({ pressed }) => [styles.promptChip, { opacity: pressed ? 0.88 : 1 }]}
              >
                <Text style={styles.promptTxt}>{t("home.coachPrompt1")}</Text>
              </Pressable>
              <Pressable
                onPress={() => applyPrompt(t("home.coachPrompt2"))}
                style={({ pressed }) => [styles.promptChip, { opacity: pressed ? 0.88 : 1 }]}
              >
                <Text style={styles.promptTxt}>{t("home.coachPrompt2")}</Text>
              </Pressable>
              <Pressable
                onPress={() => applyPrompt(t("home.coachPrompt3"))}
                style={({ pressed }) => [styles.promptChip, { opacity: pressed ? 0.88 : 1 }]}
              >
                <Text style={styles.promptTxt}>{t("home.coachPrompt3")}</Text>
              </Pressable>
            </View>

            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={t("home.coachSheetPlaceholder")}
              placeholderTextColor={colors.slate500}
              multiline
              style={styles.input}
              maxLength={400}
            />

            <Pressable
              onPress={() => goFullChat()}
              accessibilityRole="button"
              accessibilityLabel={t("home.coachSheetCta")}
              style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}
            >
              <LinearGradient colors={["#059669", "#0284C7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cta}>
                <Text style={styles.ctaTxt}>{t("home.coachSheetCta")}</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={colors.white} />
              </LinearGradient>
            </Pressable>

            <Pressable onPress={onClose} accessibilityRole="button" style={styles.dismiss}>
              <Text style={styles.dismissTxt}>{t("home.coachSheetDismiss")}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    zIndex: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      default: { elevation: 10 },
    }),
  },
  fabInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  sheet: {
    backgroundColor: "#0F172A",
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(45,212,191,0.35)",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(148,163,184,0.5)",
    marginBottom: 4,
  },
  sheetTitle: {
    fontFamily: font.extrabold,
    fontSize: 18,
    color: colors.white,
  },
  sheetSub: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.slate400,
    lineHeight: 17,
  },
  promptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  promptChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(34,211,238,0.35)",
  },
  promptTxt: {
    fontFamily: font.bold,
    fontSize: 11,
    color: "#E2E8F0",
  },
  input: {
    minHeight: 72,
    maxHeight: 120,
    borderRadius: radii.cardMd,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: font.semibold,
    fontSize: 14,
    color: colors.white,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(148,163,184,0.35)",
    textAlignVertical: "top",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: touch.buttonHeight - 6,
    borderRadius: radii.btn,
    paddingHorizontal: 16,
  },
  ctaTxt: {
    fontFamily: font.extrabold,
    fontSize: 16,
    color: colors.white,
  },
  dismiss: {
    alignItems: "center",
    paddingVertical: 8,
  },
  dismissTxt: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.slate400,
  },
});
