import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState, useEffect } from "react";
import { GradientPrimaryButton } from "../../module01/components/gradient-primary-button";
import { Module01Layout } from "../../module01/components/module01-layout";
import { fetchApi } from "../../../core/lib/api";
import { useAuthStore } from "../../../core/store/auth-store";
import { colors, iosCardShadow, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";

export function SettingsEditProfileScreen({ navigation }: ProfileStackScreenProps<"EditProfile">): ReactElement {
  const user = useAuthStore((s) => s.user);
  
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.profile) {
      setFullName(user.profile.fullName || "");
      if (user.profile.dob) {
        const birthYear = new Date(user.profile.dob).getFullYear();
        const currentYear = new Date().getFullYear();
        setAge(String(currentYear - birthYear));
      }
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - Number(age));
      
      await fetchApi('/users/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName,
          dob: dob.toISOString().split('T')[0],
        })
      });
      // Optionally refresh user in store here if needed
      navigation.goBack();
    } catch (e) {
      console.log('Lỗi cập nhật profile:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Module01Layout variant="onboardingMint" contentInset={layout.contentPadSettingsDetail} scrollable keyboardAvoiding>
      <View style={{ width: "100%", gap: 16, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.slate900} />
          </Pressable>
          <Text style={{ fontFamily: font.extrabold, fontSize: 24, color: colors.slate900 }}>Edit Profile</Text>
        </View>

        <View
          style={{
            borderRadius: radii.card,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: colors.slate200,
            backgroundColor: colors.white,
            padding: 18,
            gap: 12,
            ...iosCardShadow,
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Display name</Text>
          <Text style={{ fontFamily: font.extrabold, fontSize: 24, letterSpacing: -0.4, color: colors.slate900 }}>
            {fullName || user?.email || "Your profile"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                backgroundColor: "#ECFDF5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="account" size={28} color="#0F766E" />
            </View>
            <Pressable
              style={{
                borderRadius: radii.cardMd,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate700 }}>Change photo</Text>
            </Pressable>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Display name"
              placeholderTextColor={colors.slate400}
              style={{
                borderRadius: radii.cardMd,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
                backgroundColor: colors.slate100,
                paddingVertical: 10,
                paddingHorizontal: 12,
                fontFamily: font.medium,
                fontSize: 15,
                color: colors.slate900,
              }}
            />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: font.bold, fontSize: 12, color: colors.slate500 }}>Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="Age"
              placeholderTextColor={colors.slate400}
              style={{
                borderRadius: radii.cardMd,
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: colors.slate200,
                backgroundColor: colors.slate100,
                paddingVertical: 10,
                paddingHorizontal: 12,
                fontFamily: font.medium,
                fontSize: 15,
                color: colors.slate900,
              }}
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />
        <GradientPrimaryButton 
          label={loading ? "Saving..." : "Save Profile"} 
          onPress={handleSave} 
          height={56} 
        />
      </View>
    </Module01Layout>
  );
}
