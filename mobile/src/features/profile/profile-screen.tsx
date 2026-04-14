import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { MeResponseDto } from "@health-fitness/shared";
import { apiFetch } from "../../core/api/client";
import { ErrorState } from "../../core/ui-states/error-state";
import { LoadingState } from "../../core/ui-states/loading-state";
import type { AppStackParamList } from "../../core/navigation/types";

type Props = StackScreenProps<AppStackParamList, "Profile">;

type LoadState = "loading" | "error" | "ready";

const GENDERS = ["male", "female", "other"] as const;
const GOAL_TYPES = ["weight_loss", "muscle_gain", "maintenance"] as const;

export function ProfileScreen(_props: Props) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<(typeof GENDERS)[number] | "">("");
  const [dob, setDob] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [timezone, setTimezone] = useState("");
  const [locale, setLocale] = useState("");

  const [goalType, setGoalType] = useState<(typeof GOAL_TYPES)[number]>(
    "maintenance",
  );
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [weeklyWorkoutTarget, setWeeklyWorkoutTarget] = useState("");
  const [dailyKcalTarget, setDailyKcalTarget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const applyMe = useCallback((me: MeResponseDto) => {
    const p = me.profile;
    setFullName(p?.fullName ?? "");
    setGender(
      p?.gender && (GENDERS as readonly string[]).includes(p.gender)
        ? (p.gender as (typeof GENDERS)[number])
        : "",
    );
    setDob(p?.dob ?? "");
    setHeightCm(p?.heightCm ?? "");
    setActivityLevel(p?.activityLevel ?? "");
    setTimezone(p?.timezone ?? "");
    setLocale(p?.locale ?? "");

    const g = me.goals[0];
    if (g) {
      setGoalType(
        (GOAL_TYPES as readonly string[]).includes(g.goalType)
          ? (g.goalType as (typeof GOAL_TYPES)[number])
          : "maintenance",
      );
      setTargetWeightKg(g.targetWeightKg ?? "");
      setWeeklyWorkoutTarget(
        g.weeklyWorkoutTarget !== null && g.weeklyWorkoutTarget !== undefined
          ? String(g.weeklyWorkoutTarget)
          : "",
      );
      setDailyKcalTarget(
        g.dailyKcalTarget !== null && g.dailyKcalTarget !== undefined
          ? String(g.dailyKcalTarget)
          : "",
      );
      setStartDate(g.startDate ?? "");
      setTargetDate(g.targetDate ?? "");
    }
  }, []);

  const loadMe = useCallback(async () => {
    setLoadState("loading");
    setLoadError(null);
    try {
      const me = await apiFetch<MeResponseDto>("/api/v1/me", { auth: true });
      applyMe(me);
      setLoadState("ready");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không tải được hồ sơ";
      setLoadError(message);
      setLoadState("error");
    }
  }, [applyMe]);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  const onSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      let heightNum: number | null = null;
      if (heightCm.trim() !== "") {
        const parsed = Number(heightCm.replace(",", "."));
        if (Number.isNaN(parsed)) {
          setSaveError("Chiều cao không hợp lệ");
          setSaving(false);
          return;
        }
        heightNum = parsed;
      }

      let targetW: number | null = null;
      if (targetWeightKg.trim() !== "") {
        const parsed = Number(targetWeightKg.replace(",", "."));
        if (Number.isNaN(parsed)) {
          setSaveError("Cân nặng mục tiêu không hợp lệ");
          setSaving(false);
          return;
        }
        targetW = parsed;
      }

      let weekly: number | null = null;
      if (weeklyWorkoutTarget.trim() !== "") {
        const parsed = Number.parseInt(weeklyWorkoutTarget, 10);
        if (Number.isNaN(parsed)) {
          setSaveError("Số buổi tập không hợp lệ");
          setSaving(false);
          return;
        }
        weekly = parsed;
      }

      let dailyK: number | null = null;
      if (dailyKcalTarget.trim() !== "") {
        const parsed = Number.parseInt(dailyKcalTarget, 10);
        if (Number.isNaN(parsed)) {
          setSaveError("Calo mục tiêu không hợp lệ");
          setSaving(false);
          return;
        }
        dailyK = parsed;
      }

      const profileBody: Record<string, unknown> = {
        fullName: fullName.trim() === "" ? null : fullName.trim(),
        gender: gender === "" ? null : gender,
        dob: dob.trim() === "" ? null : dob.trim(),
        heightCm: heightNum,
        activityLevel: activityLevel.trim() === "" ? null : activityLevel.trim(),
        timezone: timezone.trim() === "" ? null : timezone.trim(),
        locale: locale.trim() === "" ? null : locale.trim(),
      };

      await apiFetch<MeResponseDto>("/api/v1/me/profile", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(profileBody),
      });

      const goalsBody = {
        goalType,
        targetWeightKg: targetW,
        weeklyWorkoutTarget: weekly,
        dailyKcalTarget: dailyK,
        startDate: startDate.trim() === "" ? null : startDate.trim(),
        targetDate: targetDate.trim() === "" ? null : targetDate.trim(),
        isActive: true,
      };

      const me = await apiFetch<MeResponseDto>("/api/v1/me/goals", {
        method: "PUT",
        auth: true,
        body: JSON.stringify(goalsBody),
      });
      applyMe(me);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không lưu được. Thử lại.";
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loadState === "loading") {
    return <LoadingState message="Đang tải hồ sơ..." />;
  }

  if (loadState === "error") {
    return (
      <ErrorState
        title="Không tải được hồ sơ"
        message={loadError ?? "Lỗi không xác định"}
        onRetry={() => void loadMe()}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.section}>Hồ sơ</Text>

      <Text style={styles.label}>Họ tên</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nguyễn Văn A"
      />

      <Text style={styles.label}>Giới tính</Text>
      <View style={styles.row}>
        {GENDERS.map((g) => (
          <Pressable
            key={g}
            style={[styles.chip, gender === g && styles.chipActive]}
            onPress={() => setGender(g)}
          >
            <Text style={styles.chipText}>{g}</Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.chip, gender === "" && styles.chipActive]}
          onPress={() => setGender("")}
        >
          <Text style={styles.chipText}>—</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Ngày sinh (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={dob}
        onChangeText={setDob}
        placeholder="1990-01-15"
      />

      <Text style={styles.label}>Chiều cao (cm)</Text>
      <TextInput
        style={styles.input}
        value={heightCm}
        onChangeText={setHeightCm}
        keyboardType="decimal-pad"
        placeholder="170"
      />

      <Text style={styles.label}>Mức độ vận động</Text>
      <TextInput
        style={styles.input}
        value={activityLevel}
        onChangeText={setActivityLevel}
        placeholder="moderate"
      />

      <Text style={styles.label}>Múi giờ</Text>
      <TextInput
        style={styles.input}
        value={timezone}
        onChangeText={setTimezone}
        placeholder="Asia/Ho_Chi_Minh"
      />

      <Text style={styles.label}>Ngôn ngữ (locale)</Text>
      <TextInput
        style={styles.input}
        value={locale}
        onChangeText={setLocale}
        placeholder="vi-VN"
      />

      <Text style={styles.section}>Mục tiêu</Text>

      <Text style={styles.label}>Loại mục tiêu</Text>
      <View style={styles.row}>
        {GOAL_TYPES.map((g) => (
          <Pressable
            key={g}
            style={[styles.chip, goalType === g && styles.chipActive]}
            onPress={() => setGoalType(g)}
          >
            <Text style={styles.chipText}>{g}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Cân nặng mục tiêu (kg)</Text>
      <TextInput
        style={styles.input}
        value={targetWeightKg}
        onChangeText={setTargetWeightKg}
        keyboardType="decimal-pad"
        placeholder="65"
      />

      <Text style={styles.label}>Số buổi tập / tuần</Text>
      <TextInput
        style={styles.input}
        value={weeklyWorkoutTarget}
        onChangeText={setWeeklyWorkoutTarget}
        keyboardType="number-pad"
        placeholder="4"
      />

      <Text style={styles.label}>Calo mục tiêu / ngày</Text>
      <TextInput
        style={styles.input}
        value={dailyKcalTarget}
        onChangeText={setDailyKcalTarget}
        keyboardType="number-pad"
        placeholder="2000"
      />

      <Text style={styles.label}>Ngày bắt đầu (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={startDate}
        onChangeText={setStartDate}
        placeholder="2026-01-01"
      />

      <Text style={styles.label}>Ngày đạt mục tiêu (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={targetDate}
        onChangeText={setTargetDate}
        placeholder="2026-12-31"
      />

      {saveError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {saveError}
        </Text>
      ) : null}

      <Pressable
        style={[styles.primary, saving && styles.disabled]}
        disabled={saving}
        onPress={() => void onSave()}
      >
        <Text style={styles.primaryText}>
          {saving ? "Đang lưu..." : "Lưu hồ sơ và mục tiêu"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  chipActive: {
    borderColor: "#111827",
    backgroundColor: "#f3f4f6",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  error: {
    color: "#b91c1c",
    marginTop: 12,
  },
  primary: {
    marginTop: 20,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
});
