import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSleepStore, formatSleepDuration, getSleepQualityLabel, getSleepQualityColor } from "../store/sleep-store";

const SLEEP_GOALS = [
  { hours: 6, label: "6 hours" },
  { hours: 7, label: "7 hours" },
  { hours: 8, label: "8 hours" },
  { hours: 9, label: "9 hours" },
];

const QUALITY_OPTIONS = [
  { value: 1, label: "Poor", emoji: "😫" },
  { value: 2, label: "Fair", emoji: "😕" },
  { value: 3, label: "Good", emoji: "🙂" },
  { value: 4, label: "Great", emoji: "😊" },
  { value: 5, label: "Excellent", emoji: "😴" },
];

export function SleepScreen() {
  const {
    todaySummary,
    logs,
    isLoading,
    fetchTodaySummary,
    fetchLogs,
    logSleep,
  } = useSleepStore();

  const [showLogModal, setShowLogModal] = useState(false);
  const [sleepTime, setSleepTime] = useState(new Date());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [quality, setQuality] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    fetchTodaySummary();
    fetchLogs();
  }, []);

  const handleLogSleep = async () => {
    if (wakeTime <= sleepTime) {
      Alert.alert("Invalid Times", "Wake time must be after sleep time");
      return;
    }

    setIsLogging(true);
    try {
      await logSleep({
        sleepTime: sleepTime.toISOString(),
        wakeTime: wakeTime.toISOString(),
        quality: quality ?? undefined,
        notes: notes || undefined,
      });
      setShowLogModal(false);
      resetForm();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to log sleep");
    } finally {
      setIsLogging(false);
    }
  };

  const resetForm = () => {
    setSleepTime(new Date());
    setWakeTime(new Date());
    setQuality(null);
    setNotes("");
  };

  const totalSleepMin = todaySummary?.totalSleepMin || 0;
  const sleepGoalMin = todaySummary?.sleepGoalMin || 480;
  const percentage = Math.min(100, Math.round((totalSleepMin / sleepGoalMin) * 100));

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#6366F1", "#4F46E5"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Sleep Tracker</Text>
        <Text style={styles.headerSubtitle}>
          Monitor your sleep quality
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Tonight's Sleep</Text>
            <TouchableOpacity
              style={styles.logButton}
              onPress={() => setShowLogModal(true)}
            >
              <Text style={styles.logButtonText}>+ Log Sleep</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatSleepDuration(totalSleepMin)}
              </Text>
              <Text style={styles.statLabel}>Total Sleep</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{percentage}%</Text>
              <Text style={styles.statLabel}>of Goal</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.qualityBadge}>
                <Text
                  style={[
                    styles.qualityText,
                    { color: getSleepQualityColor(todaySummary?.avgQuality ?? null) },
                  ]}
                >
                  {getSleepQualityLabel(todaySummary?.avgQuality ?? null)}
                </Text>
              </View>
              <Text style={styles.statLabel}>Quality</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${percentage}%` },
                ]}
              />
            </View>
            <Text style={styles.goalText}>
              {formatSleepDuration(sleepGoalMin)} goal
            </Text>
          </View>
        </View>

        {/* Sleep Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🛏️</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Consistent Schedule</Text>
              <Text style={styles.tipText}>
                Go to bed and wake up at the same time every day
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>📱</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Screen Time</Text>
              <Text style={styles.tipText}>
                Avoid screens 1 hour before bedtime
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🌡️</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Room Temperature</Text>
              <Text style={styles.tipText}>
                Keep your bedroom cool (18-21°C) for better sleep
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Sleep Logs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sleep</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No sleep logs yet</Text>
              <Text style={styles.emptySubtext}>
                Tap "Log Sleep" to record your first entry
              </Text>
            </View>
          ) : (
            logs.slice(0, 5).map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logLeft}>
                  <Text style={styles.logDate}>
                    {new Date(log.sleepTime).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                  <Text style={styles.logTime}>
                    {formatTime(new Date(log.sleepTime))} -{" "}
                    {formatTime(new Date(log.wakeTime))}
                  </Text>
                </View>
                <View style={styles.logRight}>
                  <Text style={styles.logDuration}>
                    {formatSleepDuration(log.durationMinutes || 0)}
                  </Text>
                  {log.quality && (
                    <Text style={styles.logQuality}>
                      {getSleepQualityLabel(log.quality)}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Log Sleep Modal */}
      <Modal
        visible={showLogModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLogModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowLogModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Log Sleep</Text>
            <TouchableOpacity onPress={handleLogSleep} disabled={isLogging}>
              <Text
                style={[
                  styles.modalSave,
                  isLogging && styles.modalSaveDisabled,
                ]}
              >
                {isLogging ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Sleep Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sleep Time</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowSleepPicker(true)}
              >
                <Text style={styles.timePickerText}>
                  {formatTime(sleepTime)}
                </Text>
                <Text style={styles.timePickerHint}>Yesterday</Text>
              </TouchableOpacity>
              {showSleepPicker && (
                <DateTimePicker
                  value={sleepTime}
                  mode="datetime"
                  display="spinner"
                  onChange={(event, date) => {
                    setShowSleepPicker(false);
                    if (date) setSleepTime(date);
                  }}
                />
              )}
            </View>

            {/* Wake Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Wake Time</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowWakePicker(true)}
              >
                <Text style={styles.timePickerText}>
                  {formatTime(wakeTime)}
                </Text>
                <Text style={styles.timePickerHint}>Today</Text>
              </TouchableOpacity>
              {showWakePicker && (
                <DateTimePicker
                  value={wakeTime}
                  mode="datetime"
                  display="spinner"
                  onChange={(event, date) => {
                    setShowWakePicker(false);
                    if (date) setWakeTime(date);
                  }}
                />
              )}
            </View>

            {/* Sleep Duration Preview */}
            {wakeTime > sleepTime && (
              <View style={styles.durationPreview}>
                <Text style={styles.durationLabel}>Sleep Duration</Text>
                <Text style={styles.durationValue}>
                  {formatSleepDuration(
                    Math.round(
                      (wakeTime.getTime() - sleepTime.getTime()) / 60000
                    )
                  )}
                </Text>
              </View>
            )}

            {/* Quality Rating */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Sleep Quality (Optional)</Text>
              <View style={styles.qualityOptions}>
                {QUALITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.qualityOption,
                      quality === option.value && styles.qualityOptionSelected,
                    ]}
                    onPress={() => setQuality(option.value)}
                  >
                    <Text style={styles.qualityEmoji}>{option.emoji}</Text>
                    <Text
                      style={[
                        styles.qualityOptionLabel,
                        quality === option.value &&
                          styles.qualityOptionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <View style={styles.notesInput}>
                <Text style={styles.notesPlaceholder}>
                  How did you feel? Any factors affecting your sleep?
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -16,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  logButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
  },
  qualityBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityText: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 4,
  },
  goalText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "right",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  tipText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  logItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  logLeft: {},
  logDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  logTime: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  logRight: {
    alignItems: "flex-end",
  },
  logDuration: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366F1",
  },
  logQuality: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalCancel: {
    fontSize: 16,
    color: "#6B7280",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  modalSave: {
    fontSize: 16,
    color: "#6366F1",
    fontWeight: "600",
  },
  modalSaveDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  timePickerButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timePickerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  timePickerHint: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  durationPreview: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  durationLabel: {
    fontSize: 12,
    color: "#6366F1",
    marginBottom: 4,
  },
  durationValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6366F1",
  },
  qualityOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  qualityOption: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    width: 64,
  },
  qualityOptionSelected: {
    borderColor: "#6366F1",
    backgroundColor: "#EEF2FF",
  },
  qualityEmoji: {
    fontSize: 24,
  },
  qualityOptionLabel: {
    fontSize: 10,
    color: "#6B7280",
    marginTop: 4,
  },
  qualityOptionLabelSelected: {
    color: "#6366F1",
    fontWeight: "600",
  },
  notesInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 100,
  },
  notesPlaceholder: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
