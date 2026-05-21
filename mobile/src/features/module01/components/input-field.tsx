import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
} from "react-native";
import { font } from "../theme/fonts";
import { colors, radii, semantic, space, touch } from "../theme/tokens";

type InputFieldProps = {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  secure?: boolean;
  autoComplete?: TextInputProps["autoComplete"];
  textContentType?: TextInputProps["textContentType"];
  keyboardType?: TextInputProps["keyboardType"];
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  testID?: string;
};

export function InputField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  error,
  secure,
  autoComplete,
  textContentType,
  keyboardType,
  returnKeyType,
  onSubmitEditing,
  testID,
}: InputFieldProps): ReactElement {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);

  const borderColor = hasError
    ? semantic.error
    : focused
      ? semantic.focusBorder
      : colors.slate200;

  return (
    <View style={styles.root} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          { borderColor },
          hasError && styles.fieldError,
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={hasError ? semantic.error : colors.slate500}
          importantForAccessibility="no"
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={colors.slate500}
          secureTextEntry={secure}
          keyboardType={keyboardType ?? (secure ? "default" : "email-address")}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          underlineColorAndroid="transparent"
          cursorColor={colors.cyan600}
          selectionColor={colors.cyan600}
          style={[styles.input, styles.inputNoChrome, Platform.OS === "web" && WEB_INPUT_OUTLINE_OFF]}
          accessibilityLabel={label}
          accessibilityHint={hasError ? error : undefined}
        />
      </View>
      {hasError ? (
        <Text
          style={styles.errorText}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/** Web: kill UA focus ring / shadow so only the outer pill border shows */
const WEB_INPUT_OUTLINE_OFF = {
  outlineWidth: 0,
  borderWidth: 0,
  borderColor: "transparent",
  boxShadow: "none",
} as any;

const styles = StyleSheet.create({
  root: {
    width: "100%",
    gap: space.s1,
  },
  label: {
    fontFamily: font.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.slate700,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s2,
    minHeight: touch.inputMinHeight,
    borderRadius: radii.input,
    borderWidth: 1.5,
    backgroundColor: colors.white,
    paddingHorizontal: space.s2 + 2,
    overflow: "hidden",
  },
  fieldError: {
    backgroundColor: colors.slate100,
  },
  /** Strip native EditText / input chrome — outer `field` owns the visible border */
  inputNoChrome: {
    minWidth: 0,
    borderWidth: 0,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  input: {
    flex: 1,
    alignSelf: "stretch",
    fontFamily: font.regular,
    fontSize: 16,
    color: colors.slate900,
    ...Platform.select({
      ios: {
        paddingVertical: 12,
        lineHeight: 22,
      },
      android: {
        paddingVertical: 0,
        paddingHorizontal: 0,
        marginVertical: 0,
        marginHorizontal: 0,
        textAlignVertical: "center",
        includeFontPadding: false,
        elevation: 0,
      },
      default: {
        paddingVertical: 12,
        lineHeight: 22,
      },
    }),
  },
  errorText: {
    fontFamily: font.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: semantic.error,
  },
});
