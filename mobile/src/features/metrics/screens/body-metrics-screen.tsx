import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { StackScreenProps } from "@react-navigation/stack";
import type { BodyMetricLogDto } from "@health-fitness/shared";
import type { AppStackParamList } from "../../../core/navigation/types";
import { appTheme } from "../../../core/theme/app-theme";
import { ScreenScroll } from "../../../core/ui/screen-scaffold";
import { ErrorState } from "../../../core/ui-states/error-state";
import { LoadingState } from "../../../core/ui-states/loading-state";
import { EmptyState } from "../../../core/ui-states/empty-state";
import { ApiClientError } from "../../../core/api/api-error";
import { isApiErrorBody } from "../../../core/api/client";
import {
  createBodyMetric,
  fetchBodyMetrics,
} from "../services/body-metrics-api";

type Props = StackScreenProps<AppStackParamList, "BodyMetrics">;

function offsetDate(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function BodyMetricsScreen(_props: Props) {
  const range = useMemo(
    () => ({ from: offsetDate(-60), to: offsetDate(0) }),
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<BodyMetricLogDto[]>([]);
  const [weight, setWeight] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchBodyMetrics(range.from, range.to);
      setRows(data);
    } catch (e) {
      const msg =
        e instanceof ApiClientError && isApiErrorBody(e.body)
          ? e.body.message
          : "Không tải được chỉ số";
      setError(msg);
    }
  }, [range.from, range.to]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
      if (!cancelled) {
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const save = async () => {
    const w = Number(weight.replace(",", "."));
    if (!Number.isFinite(w) || w < 20 || w > 400) {
      setError("Nhập cân nặng hợp lệ (20–400 kg).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createBodyMetric({
        recordedAt: new Date().toISOString(),
        weightKg: w,
      });
      setWeight("");
      await load();
    } catch (e) {
      const msg =
        e instanceof ApiClientError && isApiErrorBody(e.body)
          ? e.body.message
          : "Không lưu được";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingState message="Đang tải…" />;
  }

  if (error && rows.length === 0) {
    return (
      <ErrorState
        title="Không tải được"
        message={error}
        onRetry={() => void load()}
      />
    );
  }

  return (
    <ScreenScroll refreshing={refreshing} onRefresh={onRefresh}>
      {error ? <Text style={styles.banner}>{error}</Text> : null}

      <View style={styles.hero}>
        <Text style={styles.title}>Chỉ số cơ thể</Text>
        <Text style={styles.sub}>
          Đang xem khoảng {range.from} → {range.to} (UTC). Thêm bản ghi mới sẽ
          hiện trong danh sách sau khi lưu.
        </Text>
      </View>

      <Text style={styles.section}>Ghi cân nặng (kg)</Text>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        style={styles.input}
        placeholder="Ví dụ 72.4"
        placeholderTextColor={appTheme.colors.textSoft}
      />
      <Pressable
        style={({ pressed }) => [
          styles.btn,
          (busy || pressed) && styles.btnPressed,
        ]}
        onPress={() => void save()}
        disabled={busy}
      >
        <Text style={styles.btnText}>{busy ? "Đang lưu…" : "Lưu bản ghi"}</Text>
      </Pressable>

      <Text style={styles.section}>Lịch sử</Text>
      {rows.length === 0 ? (
        <EmptyState
          title="Chưa có dữ liệu"
          description="Nhập cân và lưu để bắt đầu theo dõi."
        />
      ) : (
        rows.map((r) => (
          <View key={r.id} style={styles.row}>
            <Text style={styles.rowMain}>
              {r.recordedAt.slice(0, 10)} — {r.weightKg ?? "—"} kg
            </Text>
            {r.bodyFatPct ? (
              <Text style={styles.rowSub}>Mỡ cơ thể {r.bodyFatPct}%</Text>
            ) : null}
          </View>
        ))
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  banner: {
    color: appTheme.colors.danger,
    marginBottom: appTheme.space.sm,
    fontSize: 14,
  },
  hero: {
    marginBottom: appTheme.space.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: appTheme.colors.text,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    color: appTheme.colors.textMuted,
    lineHeight: 20,
  },
  section: {
    marginTop: appTheme.space.md,
    fontWeight: "800",
    fontSize: 15,
    color: appTheme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: appTheme.colors.borderStrong,
    borderRadius: appTheme.radius.md,
    padding: 14,
    marginTop: 8,
    fontSize: 17,
    backgroundColor: appTheme.colors.surface,
    color: appTheme.colors.text,
  },
  btn: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: appTheme.radius.md,
  },
  btnPressed: { opacity: 0.9 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  row: {
    backgroundColor: appTheme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: appTheme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: appTheme.colors.border,
  },
  rowMain: { fontSize: 15, fontWeight: "700", color: appTheme.colors.text },
  rowSub: { fontSize: 13, color: appTheme.colors.textMuted, marginTop: 4 },
});
