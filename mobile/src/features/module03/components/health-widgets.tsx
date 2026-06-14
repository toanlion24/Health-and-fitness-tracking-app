import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useWaterStore } from "../../module02/store/water-store";
import { useSleepStore, formatSleepDuration, getSleepQualityColor } from "../../module02/store/sleep-store";

interface WaterWidgetProps {
  onPress?: () => void;
}

export function WaterWidget({ onPress }: WaterWidgetProps) {
  const { todaySummary, fetchTodaySummary, isLoading } = useWaterStore();

  useEffect(() => {
    fetchTodaySummary();
  }, []);

  const totalMl = todaySummary?.totalMl || 0;
  const goalMl = todaySummary?.goalMl || 2000;
  const percentage = Math.min(100, Math.round((totalMl / goalMl) * 100));
  const remainingMl = Math.max(0, goalMl - totalMl);

  if (isLoading && !todaySummary) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.icon}>💧</Text>
        <Text style={styles.title}>Water</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statText}>
          <Text style={styles.statValue}>{totalMl}</Text> / {goalMl} ml
        </Text>
        {remainingMl > 0 && (
          <Text style={styles.remainingText}>{remainingMl} ml left</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

interface SleepWidgetProps {
  onPress?: () => void;
}

export function SleepWidget({ onPress }: SleepWidgetProps) {
  const { todaySummary, fetchTodaySummary, isLoading } = useSleepStore();

  useEffect(() => {
    fetchTodaySummary();
  }, []);

  const totalMin = todaySummary?.totalSleepMin || 0;
  const goalMin = todaySummary?.sleepGoalMin || 480;
  const percentage = Math.min(100, Math.round((totalMin / goalMin) * 100));

  if (isLoading && !todaySummary) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.icon}>😴</Text>
        <Text style={[styles.title, { color: "#6366F1" }]}>Sleep</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: "#E0E7FF" }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${percentage}%`, backgroundColor: "#6366F1" },
            ]}
          />
        </View>
        <Text style={[styles.percentageText, { color: "#6366F1" }]}>
          {percentage}%
        </Text>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statText}>
          <Text style={[styles.statValue, { color: "#6366F1" }]}>
            {formatSleepDuration(totalMin)}
          </Text>{" "}
          / {formatSleepDuration(goalMin)}
        </Text>
        {todaySummary?.avgQuality && (
          <View style={styles.qualityBadge}>
            <Text
              style={[
                styles.qualityText,
                { color: getSleepQualityColor(todaySummary.avgQuality) },
              ]}
            >
              ★ {todaySummary.avgQuality.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
    minWidth: 40,
    textAlign: "right",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
  },
  statValue: {
    fontWeight: "600",
    color: "#3B82F6",
  },
  remainingText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  qualityBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
