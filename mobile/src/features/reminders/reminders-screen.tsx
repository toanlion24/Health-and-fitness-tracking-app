import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { ReminderDto } from "@health-fitness/shared";
import { appTheme } from "../../core/theme/app-theme";
import { EmptyState } from "../../core/ui-states/empty-state";
import { ErrorState } from "../../core/ui-states/error-state";
import { LoadingState } from "../../core/ui-states/loading-state";
import { ScreenScroll } from "../../core/ui/screen-scaffold";
import type { AppStackParamList } from "../../core/navigation/types";
import {
  deleteReminder,
  fetchReminders,
  patchReminder,
} from "./reminders-api";

type Props = StackScreenProps<AppStackParamList, "Reminders">;

function defaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  } catch {
    return "UTC";
  }
}

export function RemindersScreen(_props: Props) {
  const [items, setItems] = useState<ReminderDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("Uống nước");
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("0");

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const list = await fetchReminders();
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onAdd(): Promise<void> {
    const h = Number(hour);
    const m = Number(minute);
    if (!Number.isInteger(h) || h < 0 || h > 23) {
      Alert.alert("Giờ không hợp lệ", "Nhập giờ 0–23.");
      return;
    }
    if (!Number.isInteger(m) || m < 0 || m > 59) {
      Alert.alert("Phút không hợp lệ", "Nhập phút 0–59.");
      return;
    }
    if (!title.trim()) {
      return;
    }
    setError(null);
    try {
      const { createReminder } = await import("./reminders-api");
      await createReminder({
        type: "water",
        title: title.trim(),
        timezone: defaultTimezone(),
        localHour: h,
        localMinute: m,
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create");
    }
  }

  async function onToggle(r: ReminderDto, value: boolean): Promise<void> {
    try {
      await patchReminder(r.id, { isEnabled: value });
      await load();
    } catch {
      Alert.alert("Lỗi", "Không cập nhật được nhắc nhở.");
    }
  }

  async function onDelete(r: ReminderDto): Promise<void> {
    Alert.alert("Xóa nhắc nhở?", r.title, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              await deleteReminder(r.id);
              await load();
            } catch {
              Alert.alert("Lỗi", "Không xóa được.");
            }
          })();
        },
      },
    ]);
  }

  if (loading && !items) {
    return <LoadingState message="Đang tải nhắc nhở..." />;
  }

  if (error && !items) {
    return (
      <ErrorState
        title="Không tải được"
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <ScreenScroll>
      <Text style={styles.heading}>Nhắc nhở</Text>
      <Text style={styles.sub}>
        Lịch hằng ngày theo múi giờ thiết bị. Worker backend gửi push qua Expo.
      </Text>

      <View style={styles.form}>
        <Text style={styles.label}>Tiêu đề</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Ví dụ: Uống nước"
        />
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Giờ</Text>
            <TextInput
              value={hour}
              onChangeText={setHour}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Phút</Text>
            <TextInput
              value={minute}
              onChangeText={setMinute}
              keyboardType="number-pad"
              style={styles.input}
            />
          </View>
        </View>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.92 }]}
          onPress={() => void onAdd()}
        >
          <Text style={styles.primaryBtnText}>Thêm nhắc (nước)</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.err}>{error}</Text> : null}

      {!items?.length ? (
        <EmptyState
          title="Chưa có nhắc nhở"
          description="Thêm một nhắc để worker gửi push đúng giờ."
        />
      ) : (
        <View style={{ marginTop: appTheme.space.md }}>
          {items.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{r.title}</Text>
                  <Text style={styles.cardMeta}>
                    {String(r.localHour).padStart(2, "0")}:
                    {String(r.localMinute).padStart(2, "0")} · {r.timezone}
                  </Text>
                </View>
                <Switch
                  value={r.isEnabled}
                  onValueChange={(v) => void onToggle(r, v)}
                />
              </View>
              <Pressable onPress={() => void onDelete(r)}>
                <Text style={styles.delete}>Xóa</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: appTheme.colors.text,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    color: appTheme.colors.textMuted,
    lineHeight: 20,
  },
  form: {
    marginTop: appTheme.space.lg,
    padding: appTheme.space.md,
    borderRadius: appTheme.radius.lg,
    backgroundColor: appTheme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    ...appTheme.shadow.card,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: appTheme.colors.textMuted,
    marginBottom: 6,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
    borderRadius: appTheme.radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: appTheme.colors.text,
    marginBottom: appTheme.space.sm,
  },
  row: { flexDirection: "row", gap: appTheme.space.sm },
  rowItem: { flex: 1 },
  primaryBtn: {
    backgroundColor: appTheme.colors.accent,
    paddingVertical: 14,
    borderRadius: appTheme.radius.md,
    alignItems: "center",
  },
  primaryBtnText: { color: "#ffffff", fontWeight: "800", fontSize: 16 },
  err: { color: appTheme.colors.danger, marginTop: appTheme.space.sm },
  card: {
    marginTop: appTheme.space.sm,
    padding: appTheme.space.md,
    borderRadius: appTheme.radius.lg,
    backgroundColor: appTheme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: appTheme.colors.text },
  cardMeta: { marginTop: 4, fontSize: 13, color: appTheme.colors.textMuted },
  delete: {
    marginTop: 10,
    color: appTheme.colors.danger,
    fontWeight: "700",
    fontSize: 14,
  },
});
