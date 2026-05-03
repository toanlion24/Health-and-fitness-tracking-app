import type { ReactElement } from "react";
import { Text, View } from "react-native";
import type { Module01StackScreenProps } from "../../../core/navigation/module01-types";
import { ActivityPickRow } from "../components/activity-pick-row";
import { OnboardingHeader } from "../components/chrome";
import { GradientPrimaryButton } from "../components/gradient-primary-button";
import { Module01Layout } from "../components/module01-layout";
import { ProgressSegments } from "../components/progress-segments";
import { useModule01Store } from "../store/module01-store";
import { colors } from "../theme/tokens";
import { font } from "../theme/fonts";

export function OnboardingActivityScreen({ navigation }: Module01StackScreenProps<"OnboardingActivity">): ReactElement {
  const activity = useModule01Store((s) => s.activity);
  const setActivity = useModule01Store((s) => s.setActivity);

  return (
    <Module01Layout variant="onboardingBlue">
      <View style={{ width: "100%", gap: 18, flex: 1 }}>
        <ProgressSegments currentStep={4} />
        <OnboardingHeader stepLabel="Step 4 of 6" onBack={() => navigation.goBack()} />
        <Text
          style={{
            fontFamily: font.bold,
            fontSize: 26,
            letterSpacing: -0.5,
            color: colors.slate900,
            maxWidth: 350,
          }}
        >
          How active are you?
        </Text>
        <Text style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 19.6, color: colors.slate500, maxWidth: 350 }}>
          Choose the option that feels most like your week.
        </Text>
        <View style={{ gap: 10 }}>
          <ActivityPickRow
            level="sedentary"
            selected={activity === "sedentary"}
            onSelect={() => setActivity("sedentary")}
            title="Sedentary"
            subtitle="Desk job, little movement"
            icon="sofa-outline"
          />
          <ActivityPickRow
            level="light"
            selected={activity === "light"}
            onSelect={() => setActivity("light")}
            title="Lightly active"
            subtitle="1–3 workouts / week"
            icon="walk"
          />
          <ActivityPickRow
            level="moderate"
            selected={activity === "moderate"}
            onSelect={() => setActivity("moderate")}
            title="Moderate"
            subtitle="3–5 workouts / week"
            icon="lightning-bolt"
          />
          <ActivityPickRow
            level="very"
            selected={activity === "very"}
            onSelect={() => setActivity("very")}
            title="Very active"
            subtitle="6+ sessions / week"
            icon="fire"
          />
        </View>
        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label="Next" onPress={() => navigation.navigate("OnboardingGoal")} />
      </View>
    </Module01Layout>
  );
}
