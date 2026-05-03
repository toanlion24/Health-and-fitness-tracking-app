import type { ReactElement } from "react";
import { memo, useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { Module01StackScreenProps } from "../../../core/navigation/module01-types";
import { AgeSlider } from "../components/age-slider";
import { OnboardingHeader } from "../components/chrome";
import { GradientPrimaryButton } from "../components/gradient-primary-button";
import { Module01Layout } from "../components/module01-layout";
import { ProgressSegments } from "../components/progress-segments";
import { useModule01Store } from "../store/module01-store";
import { colors } from "../theme/tokens";
import { font } from "../theme/fonts";

type ChromeProps = {
  onBack: () => void;
};

/** Progress + copy only; memoized so dragging the slider does not re-render this block every frame. */
const AgeOnboardingChrome = memo(function AgeOnboardingChrome({ onBack }: ChromeProps): ReactElement {
  return (
    <>
      <ProgressSegments currentStep={2} />
      <OnboardingHeader stepLabel="Step 2 of 6" onBack={onBack} />
      <Text style={styles.headline}>How old are you?</Text>
      <Text style={styles.subcopy}>Slide to your age. This takes just a second.</Text>
    </>
  );
});

export function OnboardingAgeScreen({ navigation }: Module01StackScreenProps<"OnboardingAge">): ReactElement {
  const setAgeStore = useModule01Store((s) => s.setAge);
  /** Local age while dragging — avoids writing Zustand every tick (was causing heavy re-renders / jank). */
  const [age, setAge] = useState(() => useModule01Store.getState().age);

  useFocusEffect(
    useCallback(() => {
      setAge(useModule01Store.getState().age);
    }, []),
  );

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onNext = useCallback(() => {
    setAgeStore(age);
    navigation.navigate("OnboardingBody");
  }, [age, navigation, setAgeStore]);

  return (
    <Module01Layout variant="onboardingBlue">
      <View style={styles.column}>
        <AgeOnboardingChrome onBack={handleBack} />
        <View style={styles.ageBlock}>
          <Text style={styles.ageNum}>{age}</Text>
          <Text style={styles.ageUnit}>years old</Text>
        </View>
        <AgeSlider value={age} onChange={setAge} />
        <View style={{ flex: 1 }} />
        <GradientPrimaryButton label="Next" onPress={onNext} />
      </View>
    </Module01Layout>
  );
}

const styles = StyleSheet.create({
  column: {
    width: "100%",
    gap: 24,
    flex: 1,
  },
  headline: {
    fontFamily: font.bold,
    fontSize: 26,
    letterSpacing: -0.5,
    color: colors.slate900,
    maxWidth: 350,
  },
  subcopy: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: colors.slate500,
    maxWidth: 350,
  },
  ageBlock: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
    width: "100%",
  },
  ageNum: {
    fontFamily: font.extrabold,
    fontSize: 72,
    letterSpacing: -2,
    color: colors.slate900,
  },
  ageUnit: {
    fontFamily: font.medium,
    fontSize: 15,
    color: colors.slate500,
  },
});
