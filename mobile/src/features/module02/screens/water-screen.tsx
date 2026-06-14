import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useWaterStore } from "../store/water-store";

const WATER_AMOUNTS = [
  { ml: 150, label: "Small glass" },
  { ml: 250, label: "Regular glass" },
  { ml: 350, label: "Large glass" },
  { ml: 500, label: "Bottle" },
  { ml: 750, label: "Large bottle" },
  { ml: 1000, label: "1 Liter" },
];

export function WaterScreen() {
  const {
    todaySummary,
    isLoading,
    error,
    fetchTodaySummary,
    logWater,
  } = useWaterStore();

  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    fetchTodaySummary();
  }, []);

  const handleLogWater = async (amountMl: number) => {
    setIsLogging(true);
    try {
      await logWater(amountMl);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to log water");
    } finally {
      setIsLogging(false);
    }
  };

  const handleCustomAmount = () => {
    Alert.prompt(
      "Custom Amount",
      "Enter water amount in ml:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: (value) => {
            const amount = parseInt(value || "0", 10);
            if (amount > 0 && amount <= 2000) {
              handleLogWater(amount);
            } else {
              Alert.alert("Invalid", "Please enter a value between 1-2000ml");
            }
          },
        },
      ],
      "plain-text",
      "",
      "numeric"
    );
  };

  const totalMl = todaySummary?.totalMl || 0;
  const goalMl = todaySummary?.goalMl || 2000;
  const percentage = Math.min(100, Math.round((totalMl / goalMl) * 100));

  const glasses = Math.floor(totalMl / 250);
  const remainingMl = Math.max(0, goalMl - totalMl);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#3B82F6", "#2563EB"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Water Intake</Text>
        <Text style={styles.headerSubtitle}>
          Stay hydrated throughout the day
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Circle */}
        <View style={styles.progressSection}>
          <View style={styles.progressCircle}>
            <View style={styles.progressInner}>
              <Text style={styles.progressPercentage}>{percentage}%</Text>
              <Text style={styles.progressMl}>{totalMl} ml</Text>
              <Text style={styles.progressGoal}>of {goalMl} ml</Text>
            </View>
            <View
              style={[
                styles.progressFill,
                { width: `${percentage}%` },
              ]}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{glasses}</Text>
              <Text style={styles.statLabel}>Glasses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{remainingMl}</Text>
              <Text style={styles.statLabel}>ml left</Text>
            </View>
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
            {WATER_AMOUNTS.map((item) => (
              <TouchableOpacity
                key={item.ml}
                style={styles.quickAddButton}
                onPress={() => handleLogWater(item.ml)}
                disabled={isLogging}
              >
                <Text style={styles.quickAddMl}>{item.ml} ml</Text>
                <Text style={styles.quickAddLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.customButton}
            onPress={handleCustomAmount}
            disabled={isLogging}
          >
            <Text style={styles.customButtonText}>+ Custom Amount</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Log */}
        {todaySummary && todaySummary.glassesCount > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Glasses drunk</Text>
                <Text style={styles.summaryValue}>
                  {todaySummary.glassesCount}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Progress</Text>
                <Text style={styles.summaryValue}>{percentage}%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hydration Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>💧</Text>
            <Text style={styles.tipText}>
              Drink a glass of water first thing in the morning to kickstart your
              metabolism
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>🌡️</Text>
            <Text style={styles.tipText}>
              Increase your water intake during exercise or hot weather
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {isLogging && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
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
  progressSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  progressInner: {
    alignItems: "center",
    zIndex: 1,
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: "700",
    color: "#3B82F6",
  },
  progressMl: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 4,
  },
  progressGoal: {
    fontSize: 14,
    color: "#6B7280",
  },
  progressFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "100%",
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
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
  quickAddGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAddButton: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickAddMl: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3B82F6",
  },
  quickAddLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  customButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  customButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
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
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});
