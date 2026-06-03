import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStepTracker } from "../hooks/useStepTracker";
import { OnboardingLayout } from "../../auth/components/onboarding-layout";
import { colors, iosCardShadow, radii, touch } from "../../auth/theme/tokens";
import { font } from "../../auth/theme/fonts";

const GOAL_STORAGE_KEY = "@step_tracker_goal";
const DEFAULT_GOAL = 10000;

export function StepTrackingScreen({ navigation }: { navigation: any }) {
  const {
    steps,
    loading,
    source,
    history,
    refresh,
    isTracking,
    startTracking,
    stopTracking,
  } = useStepTracker();

  const [goal, setGoal] = useState(DEFAULT_GOAL);

  // Load saved goal from storage
  useEffect(() => {
    (async () => {
      try {
        const savedGoal = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
        if (savedGoal) {
          setGoal(parseInt(savedGoal, 10));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const toggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const handleRefresh = () => {
    if (source === "unavailable") {
      Alert.alert(
        "No Step Data Source",
        "Neither Health Connect nor the motion sensor is available on this device.\n\nTo fix this:\n1. Install the \"Health Connect\" app from Google Play Store\n2. Open it and enable step tracking\n3. Come back and tap Refresh",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Play Store",
            onPress: () =>
              Linking.openURL(
                "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata"
              ),
          },
          {
            text: "Refresh",
            onPress: () => void refresh(),
          },
        ]
      );
    } else {
      Alert.alert(
        "Sync & Refresh",
        "Refresh step data from your device?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Refresh",
            onPress: () => void refresh(),
          },
        ]
      );
    }
  };

  // Derived metrics
  const progressPercent = Math.min(100, (steps / goal) * 100);
  const caloriesBurned = (steps * 0.04).toFixed(1);
  const distanceKm = (steps * 0.0008).toFixed(2);

  // Helper to format date label
  const formatDateLabel = (dateStr: string) => {
    try {
      const parts = dateStr.split("-");
      return `${parts[2]}/${parts[1]}`;
    } catch {
      return dateStr;
    }
  };

  // Source status indicator config
  const getSourceStatus = () => {
    if (source === "health-connect") {
      return {
        dotColor: "#10B981",
        textColor: "#34D399",
        activeText: "Health Connect synced",
        pausedText: "Health Connect paused",
        icon: "heart-pulse" as const,
      };
    }
    if (source === "pedometer") {
      return {
        dotColor: "#F59E0B",
        textColor: "#FBBF24",
        activeText: "Motion sensor active",
        pausedText: "Motion sensor paused",
        icon: "run" as const,
      };
    }
    return {
      dotColor: "#EF4444",
      textColor: "#F87171",
      activeText: "No step data source available",
      pausedText: "No step data source available",
      icon: "alert-circle-outline" as const,
    };
  };

  const sourceStatus = getSourceStatus();

  if (loading) {
    return (
      <OnboardingLayout variant="coachPulse" statusBarLight contentInset={[16, 20, 24, 20]} scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.cyan600} />
          <Text style={styles.loadingText}>Connecting to step data sources...</Text>
        </View>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout variant="coachPulse" statusBarLight contentInset={[16, 20, 24, 20]} scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backButton}
            >
              <MaterialCommunityIcons name="chevron-left" size={26} color={colors.white} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Step Counter</Text>
              <Text style={styles.headerSubtitle}>Real-time activity tracking</Text>
            </View>
          </View>
        </View>

        {/* Circular Progress & Steps Card */}
        <View style={styles.stepsCard}>
          <View style={styles.progressCircleContainer}>
            {/* Outer decorative ring */}
            <View style={[styles.progressRing, { borderColor: isTracking && source !== "unavailable" ? "rgba(34, 211, 238, 0.4)" : "rgba(255, 255, 255, 0.1)" }]}>
              <View style={styles.progressInnerCircle}>
                <MaterialCommunityIcons
                  name="walk"
                  size={36}
                  color={isTracking && source !== "unavailable" ? "#5EEAD4" : colors.slate400}
                  style={{ transform: [{ scale: 1.1 }] }}
                />
                <Text style={styles.stepsCount}>{steps.toLocaleString()}</Text>
                <Text style={styles.stepsLabel}>steps</Text>
              </View>
            </View>
          </View>

          {/* Goal & Progress bar */}
          <View style={styles.goalContainer}>
            <View style={styles.goalRow}>
              <Text style={styles.progressText}>{progressPercent.toFixed(0)}% Completed</Text>
              <Text style={styles.goalText}>Goal: {goal.toLocaleString()}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          {/* Core Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <MaterialCommunityIcons name="fire" size={22} color="#F97316" />
              <Text style={styles.metricValue}>{caloriesBurned}</Text>
              <Text style={styles.metricLabel}>kcal</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.metricItem}>
              <MaterialCommunityIcons name="map-marker-distance" size={22} color="#0EA5E9" />
              <Text style={styles.metricValue}>{distanceKm}</Text>
              <Text style={styles.metricLabel}>km</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={toggleTracking}
              activeOpacity={0.8}
              disabled={source === "unavailable"}
              style={[
                styles.trackingBtn,
                source === "unavailable"
                  ? styles.trackingBtnDisabled
                  : isTracking
                  ? styles.trackingBtnActive
                  : styles.trackingBtnInactive,
              ]}
            >
              <MaterialCommunityIcons
                name={isTracking ? "pause" : "play"}
                size={22}
                color={colors.white}
              />
              <Text style={styles.trackingBtnText}>
                {source === "unavailable"
                  ? "No Source"
                  : isTracking
                  ? "Pause Tracking"
                  : "Start Tracking"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRefresh}
              activeOpacity={0.8}
              style={styles.resetBtn}
            >
              <MaterialCommunityIcons
                name="cached"
                size={20}
                color={colors.slate300}
              />
            </TouchableOpacity>
          </View>

          {/* Source status indicator */}
          <View style={styles.sensorStatusContainer}>
            <View style={[styles.pulseDot, { backgroundColor: sourceStatus.dotColor }]} />
            <MaterialCommunityIcons
              name={sourceStatus.icon}
              size={14}
              color={sourceStatus.textColor}
            />
            <Text style={[styles.liveIndicator, { color: sourceStatus.textColor }]}>
              {isTracking ? sourceStatus.activeText : sourceStatus.pausedText}
            </Text>
          </View>

          {/* Health Connect install prompt when unavailable */}
          {source === "unavailable" && (
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  "https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata"
                )
              }
              activeOpacity={0.8}
              style={styles.installPrompt}
            >
              <MaterialCommunityIcons name="download" size={16} color="#60A5FA" />
              <Text style={styles.installPromptText}>
                Install Health Connect for step tracking
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color="#60A5FA" />
            </TouchableOpacity>
          )}
        </View>

        {/* Steps History Card */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Past 6 Days History</Text>
          {history.length === 0 ? (
            <Text style={styles.noHistoryText}>
              {source === "unavailable"
                ? "Connect a step data source to see history."
                : "No step history available yet."}
            </Text>
          ) : (
            <View style={styles.historyList}>
              {history.map((item, index) => (
                <View key={item.date} style={[styles.historyRow, index === history.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                  <View style={styles.historyDateCol}>
                    <MaterialCommunityIcons name="calendar-blank" size={16} color={colors.slate400} />
                    <Text style={styles.historyDateText}>{formatDateLabel(item.date)}</Text>
                  </View>
                  <View style={styles.historyProgressCol}>
                    <View style={styles.historyBarBg}>
                      <View style={[styles.historyBarFill, { width: `${Math.min(100, (item.steps / goal) * 100)}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.historyStepsText}>{item.steps.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontFamily: font.semibold,
    fontSize: 14,
    color: colors.slate400,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: font.extrabold,
    fontSize: 24,
    color: colors.white,
  },
  headerSubtitle: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.slate400,
    marginTop: 2,
  },
  stepsCard: {
    borderRadius: radii.card,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    alignItems: "center",
    gap: 16,
    ...iosCardShadow,
    marginBottom: 16,
  },
  progressCircleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  progressRing: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  progressInnerCircle: {
    width: 172,
    height: 172,
    borderRadius: 86,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  stepsCount: {
    fontFamily: font.extrabold,
    fontSize: 36,
    color: colors.white,
    letterSpacing: -1,
  },
  stepsLabel: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.slate400,
  },
  goalContainer: {
    width: "100%",
    gap: 8,
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: "#5EEAD4",
  },
  goalText: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.slate400,
  },
  progressBarBg: {
    height: 8,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#22D3EE",
    borderRadius: 999,
  },
  metricsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  metricItem: {
    alignItems: "center",
    gap: 4,
  },
  metricValue: {
    fontFamily: font.extrabold,
    fontSize: 18,
    color: colors.white,
  },
  metricLabel: {
    fontFamily: font.bold,
    fontSize: 10,
    color: colors.slate400,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 4,
  },
  trackingBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radii.btn,
    height: touch.buttonHeight,
  },
  trackingBtnActive: {
    backgroundColor: "#059669",
  },
  trackingBtnInactive: {
    backgroundColor: colors.slate600,
  },
  trackingBtnDisabled: {
    backgroundColor: "rgba(100, 116, 139, 0.4)",
  },
  trackingBtnText: {
    fontFamily: font.extrabold,
    fontSize: 15,
    color: colors.white,
  },
  resetBtn: {
    width: touch.buttonHeight,
    height: touch.buttonHeight,
    borderRadius: radii.btn,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  sensorStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveIndicator: {
    fontFamily: font.semibold,
    fontSize: 11,
  },
  installPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(96, 165, 250, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(96, 165, 250, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  installPromptText: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: "#60A5FA",
    flex: 1,
  },
  historyCard: {
    borderRadius: radii.card,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    gap: 16,
    ...iosCardShadow,
  },
  historyTitle: {
    fontFamily: font.extrabold,
    fontSize: 15,
    color: colors.white,
  },
  noHistoryText: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.slate400,
    textAlign: "center",
    paddingVertical: 12,
  },
  historyList: {
    gap: 12,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  historyDateCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 64,
  },
  historyDateText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: colors.slate300,
  },
  historyProgressCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  historyBarBg: {
    height: 6,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 999,
    overflow: "hidden",
  },
  historyBarFill: {
    height: "100%",
    backgroundColor: "#0ea5e9",
    borderRadius: 999,
  },
  historyStepsText: {
    fontFamily: font.extrabold,
    fontSize: 13,
    color: colors.white,
    width: 56,
    textAlign: "right",
  },
});
