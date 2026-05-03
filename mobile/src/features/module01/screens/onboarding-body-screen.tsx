import type { ReactElement } from "react";
import { Text, View } from "react-native";
import type { Module01StackScreenProps } from "../../../core/navigation/module01-types";
import { MetricPicker } from "../components/metric-picker";
import { OnboardingHeader } from "../components/chrome";
import { GradientPrimaryButton } from "../components/gradient-primary-button";
import { Module01Layout } from "../components/module01-layout";
import { ProgressSegments } from "../components/progress-segments";
import { useModule01Store } from "../store/module01-store";
import { colors } from "../theme/tokens";
import { font } from "../theme/fonts";

export function OnboardingBodyScreen({ navigation }: Module01StackScreenProps<"OnboardingBody">): ReactElement {
  const heightCm = useModule01Store((s) => s.heightCm);
  const weightKg = useModule01Store((s) => s.weightKg);
  const setHeightCm = useModule01Store((s) => s.setHeightCm);
  const setWeightKg = useModule01Store((s) => s.setWeightKg);

  return (
    <Module01Layout variant="onboardingMint">
      <View style={{ width: "100%", gap: 22, flex: 1 }}>
        <ProgressSegments currentStep={3} />
        <OnboardingHeader stepLabel="Step 3 of 6" onBack={() => navigation.goBack()} />
        <Text
          style={{
            fontFamily: font.bold,
            fontSize: 26,
            letterSpacing: -0.5,
            color: colors.slate900,
            maxWidth: 350,
          }}
        >
          What&apos;s your height and weight?
        </Text>
        <Text style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 19.6, color: colors.slate500, maxWidth: 350 }}>
          Use the pickers to set your current metrics.
        </Text>
        <View style={{ flexDirection: "row", gap: 14, paddingVertical: 16, width: "100%" }}>
          <MetricPicker label="cm" min={120} max={220} value={heightCm} onChange={setHeightCm} />
          <MetricPicker label="kg" min={35} max={200} value={weightKg} onChange={setWeightKg} />
        </View>
        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label="Next" onPress={() => navigation.navigate("OnboardingActivity")} />
      </View>
    </Module01Layout>
  );
}
