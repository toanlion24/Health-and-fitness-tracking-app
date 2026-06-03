import type { ReactElement } from "react";
import { Text, View } from "react-native";
import type { AuthStackScreenProps } from "../../../core/navigation/auth-types";
import { GoalPickCard } from "../components/goal-pick-card";
import { OnboardingHeader } from "../components/chrome";
import { GradientPrimaryButton } from "../components/gradient-primary-button";
import { OnboardingLayout } from "../components/onboarding-layout";
import { ProgressSegments } from "../components/progress-segments";
import { useOnboardingStore } from "../store/onboarding-store";
import { colors } from "../theme/tokens";
import { font } from "../theme/fonts";

export function OnboardingGoalScreen({ navigation }: AuthStackScreenProps<"OnboardingGoal">): ReactElement {
  const goal = useOnboardingStore((s) => s.goal);
  const setGoal = useOnboardingStore((s) => s.setGoal);

  return (
    <OnboardingLayout variant="onboardingCyan">
      <View style={{ width: "100%", gap: 22, flex: 1 }}>
        <ProgressSegments currentStep={6} />
        <OnboardingHeader stepLabel="Step 5 of 6" onBack={() => navigation.goBack()} />
        <Text
          style={{
            fontFamily: font.bold,
            fontSize: 26,
            letterSpacing: -0.5,
            color: colors.slate900,
            maxWidth: 350,
          }}
        >
          What&apos;s your goal?
        </Text>
        <Text style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 19.6, color: colors.slate500, maxWidth: 350 }}>
          Pick one goal so we can tailor your plan.
        </Text>
        <View style={{ gap: 14 }}>
          <GoalPickCard
            goal="lose"
            selected={goal === "lose"}
            onSelect={() => setGoal("lose")}
            title="Lose weight"
            subtitle={goal === "lose" ? "Selected" : "Caloric deficit & smart cardio"}
            icon="trending-down"
            iconColor={goal === "lose" ? colors.emerald600 : colors.slate400}
          />
          <GoalPickCard
            goal="gain"
            selected={goal === "gain"}
            onSelect={() => setGoal("gain")}
            title="Gain muscle"
            subtitle={goal === "gain" ? "Selected" : "Progressive training & higher protein"}
            icon="dumbbell"
            iconColor={goal === "gain" ? colors.emerald600 : colors.slate400}
          />
          <GoalPickCard
            goal="maintain"
            selected={goal === "maintain"}
            onSelect={() => setGoal("maintain")}
            title="Maintain"
            subtitle={goal === "maintain" ? "Selected" : "Balance intake & activity"}
            icon="scale-balance"
            iconColor={goal === "maintain" ? colors.emerald600 : colors.slate400}
          />
        </View>
        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label="Next" onPress={() => navigation.navigate("OnboardingResult")} />
      </View>
    </OnboardingLayout>
  );
}
