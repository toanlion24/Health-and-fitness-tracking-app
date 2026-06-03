import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { colors, gradients } from "../theme/tokens";

type ProgressSegmentsProps = {
  /** Current step 1–6 (step 1 = first segment is “active” gradient). */
  currentStep: number;
};

export function ProgressSegments({ currentStep }: ProgressSegmentsProps): React.ReactElement {
  return (
    <View style={{ flexDirection: "row", gap: 6, width: "100%" }}>
      {Array.from({ length: 6 }, (_, i) => {
        const index = i + 1;
        if (index < currentStep) {
          return (
            <View
              key={index}
              style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: "#10B981" }}
            />
          );
        }
        if (index === currentStep) {
          return (
            <LinearGradient
              key={index}
              colors={[...gradients.primaryBtn]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ flex: 1, height: 4, borderRadius: 2 }}
            />
          );
        }
        return (
          <View
            key={index}
            style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.slate200 }}
          />
        );
      })}
    </View>
  );
}
