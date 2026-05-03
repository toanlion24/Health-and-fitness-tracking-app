import type { ReactElement } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { PrimaryButton, type PrimaryButtonProps } from "./primary-button";

type GradientPrimaryButtonProps = Omit<PrimaryButtonProps, "minHeight"> & {
  /** Row height for onboarding screens (default preserved from earlier gradient button) */
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/** Wraps `PrimaryButton`; keeps optional `height` for onboarding steps */
export function GradientPrimaryButton({
  height,
  style,
  ...rest
}: GradientPrimaryButtonProps): ReactElement {
  return <PrimaryButton {...rest} minHeight={height ?? 58} style={style} />;
}
