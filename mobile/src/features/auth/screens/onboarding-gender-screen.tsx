import type { ReactElement } from "react";
import { Text, View } from "react-native";
import type { AuthStackScreenProps } from "../../../core/navigation/auth-types";
import { OnboardingHeader } from "../components/chrome";
import { GenderPickCard } from "../components/gender-pick-card";
import { GradientPrimaryButton } from "../components/gradient-primary-button";
import { OnboardingLayout } from "../components/onboarding-layout";
import { ProgressSegments } from "../components/progress-segments";
import { useOnboardingStore } from "../store/onboarding-store";
import { colors } from "../theme/tokens";
import { font } from "../theme/fonts";

export function OnboardingGenderScreen({ navigation }: AuthStackScreenProps<"OnboardingGender">): ReactElement {
  const gender = useOnboardingStore((s) => s.gender);
  const setGender = useOnboardingStore((s) => s.setGender);

  return (
    <OnboardingLayout variant="onboardingMint">
      <View style={{ width: "100%", gap: 26, flex: 1 }}>
        <ProgressSegments currentStep={1} />
        <View style={{ gap: 8 }}>
          <OnboardingHeader stepLabel="Step 1 of 6" onBack={() => navigation.goBack()} />
        </View>
        <Text
          style={{
            fontFamily: font.bold,
            fontSize: 26,
            letterSpacing: -0.5,
            color: colors.slate900,
            maxWidth: 350,
          }}
        >
          What&apos;s your gender?
        </Text>
        <Text style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 19.6, color: colors.slate500, maxWidth: 350 }}>
          Quick setup - takes under 60 seconds.
        </Text>
        <View style={{ gap: 14 }}>
          <GenderPickCard
            gender="male"
            active={gender === "male"}
            onSelect={() => setGender("male")}
            label="Male"
            sub={gender === "male" ? "Selected" : "Tap to select"}
            icon="account"
            iconColor={gender === "male" ? colors.emerald600 : colors.slate400}
          />
          <GenderPickCard
            gender="female"
            active={gender === "female"}
            onSelect={() => setGender("female")}
            label="Female"
            sub={gender === "female" ? "Selected" : "Tap to select"}
            icon="face-woman-outline"
            iconColor={gender === "female" ? colors.emerald600 : colors.slate400}
          />
          <GenderPickCard
            gender="other"
            active={gender === "other"}
            onSelect={() => setGender("other")}
            label="Other"
            sub={gender === "other" ? "Selected" : "Tap to select"}
            icon="account-group-outline"
            iconColor={gender === "other" ? colors.emerald600 : colors.slate400}
          />
        </View>
        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label="Next" onPress={() => navigation.navigate("OnboardingAge")} />
      </View>
    </OnboardingLayout>
  );
}
