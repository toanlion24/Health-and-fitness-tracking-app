import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { GradientPrimaryButton } from "../../module01/components/gradient-primary-button";
import { Module01Layout } from "../../module01/components/module01-layout";
import { fetchApi } from "../../../core/lib/api";
import { useAuthStore } from "../../../core/store/auth-store";
import { colors, iosCardShadow, layout, radii } from "../../module01/theme/tokens";
import { font } from "../../module01/theme/fonts";
import type { ProfileStackScreenProps } from "../navigation/profile-stack-types";

const GENDER_OPTIONS = [
  { label: "Male", value: "male", icon: "gender-male" },
  { label: "Female", value: "female", icon: "gender-female" },
  { label: "Other", value: "other", icon: "gender-non-binary" },
];

const ACTIVITY_OPTIONS = [
  { label: "Sedentary", value: "sedentary" },
  { label: "Lightly Active", value: "lightly_active" },
  { label: "Active", value: "active" },
  { label: "Very Active", value: "very_active" },
];

export function SettingsEditProfileScreen({ navigation }: ProfileStackScreenProps<"EditProfile">): ReactElement {
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);
  
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.profile) {
      setFullName(user.profile.fullName || user.email?.split("@")[0] || "");
      if (user.profile.dob) {
        const birthYear = new Date(user.profile.dob).getFullYear();
        const currentYear = new Date().getFullYear();
        setAge(String(currentYear - birthYear));
      }
      if (user.profile.gender) setGender(user.profile.gender);
      if (user.profile.heightCm) setHeightCm(String(user.profile.heightCm));
      if (user.profile.activityLevel) setActivityLevel(user.profile.activityLevel);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let dobStr: string | null = null;
      const parsedAge = Number(age);
      if (age.trim() !== "" && !isNaN(parsedAge)) {
        const dob = new Date();
        dob.setFullYear(dob.getFullYear() - parsedAge);
        dobStr = dob.toISOString().split("T")[0];
      }
      
      const res = await fetchApi("/users/me/profile", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          ...(dobStr ? { dob: dobStr } : {}),
          gender: gender ? gender.toLowerCase() : null,
          heightCm: heightCm ? Number(heightCm) : null,
          activityLevel: activityLevel || null,
        })
      });
      if (!res.ok) {
        console.log("Save failed:", await res.text());
        return;
      }
      const updatedProfile = await res.json();
      
      // Fetch fresh full user object to ensure homescreen gets correct data
      const meRes = await fetchApi("/users/me");
      if (meRes.ok) {
        const freshUser = await meRes.json();
        useAuthStore.getState().updateUser(freshUser);
      } else {
        // Fallback merge
        useAuthStore.getState().updateUser({
          ...user,
          profile: updatedProfile.id ? updatedProfile.profile : updatedProfile
        });
      }
      
      navigation.goBack();
    } catch (e) {
      console.log("Lỗi cập nhật profile:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Module01Layout variant="onboardingMint" contentInset={layout.contentPadSettingsDetail} scrollable keyboardAvoiding>
      <View style={{ width: "100%", gap: 16, flex: 1, paddingBottom: 24 }}>
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

        <View style={styles.card}>
          <Text style={{ fontFamily: font.bold, fontSize: 13, color: colors.slate700 }}>Display name</Text>
          <Text style={{ fontFamily: font.extrabold, fontSize: 24, letterSpacing: -0.4, color: colors.slate900 }}>
            {fullName || user?.email?.split("@")[0] || "Your profile"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={styles.avatarHolder}>
              <MaterialCommunityIcons name="account" size={28} color="#0F766E" />
            </View>
            <Pressable style={styles.changeBtn}>
              <Text style={{ fontFamily: font.semibold, fontSize: 12, color: colors.slate700 }}>Change photo</Text>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Display name"
              placeholderTextColor={colors.slate400}
              style={styles.input}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Age</Text>
              <View style={styles.inputWithSuffix}>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="25"
                  placeholderTextColor={colors.slate400}
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                />
                <Text style={styles.suffix}>yrs</Text>
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Height</Text>
              <View style={styles.inputWithSuffix}>
                <TextInput
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="number-pad"
                  maxLength={3}
                  placeholder="170"
                  placeholderTextColor={colors.slate400}
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                />
                <Text style={styles.suffix}>cm</Text>
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.chipRow}>
              {GENDER_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setGender(opt.value)}
                  style={[
                    styles.chip,
                    gender === opt.value && styles.chipActive
                  ]}
                >
                  <MaterialCommunityIcons 
                    name={opt.icon as any} 
                    size={16} 
                    color={gender === opt.value ? colors.white : colors.slate500} 
                  />
                  <Text style={[
                    styles.chipText,
                    gender === opt.value && styles.chipTextActive
                  ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Activity Level</Text>
            <View style={styles.chipRowWrap}>
              {ACTIVITY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() => setActivityLevel(opt.value)}
                  style={[
                    styles.chip,
                    activityLevel === opt.value && styles.chipActive
                  ]}
                >
                  <Text style={[
                    styles.chipText,
                    activityLevel === opt.value && styles.chipTextActive
                  ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
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

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    backgroundColor: colors.white,
    padding: 18,
    gap: 16,
    ...iosCardShadow,
  },
  avatarHolder: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  changeBtn: {
    borderRadius: radii.cardMd,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: font.bold,
    fontSize: 12,
    color: colors.slate500,
  },
  input: {
    borderRadius: radii.cardMd,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontFamily: font.medium,
    fontSize: 15,
    color: colors.slate900,
  },
  inputWithSuffix: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.cardMd,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.slate200,
    backgroundColor: colors.slate50,
    paddingRight: 12,
  },
  suffix: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.slate400,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
  },
  chipRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.slate100,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  chipActive: {
    backgroundColor: "#0F766E",
    borderColor: "#0F766E",
  },
  chipText: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.slate600,
  },
  chipTextActive: {
    color: colors.white,
  },
});
