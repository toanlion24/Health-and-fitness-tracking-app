import { useEffect, useState, useRef, useCallback } from "react";
import { Platform, PermissionsAndroid, NativeModules, AppState } from "react-native";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Health Connect imports — will only work in custom dev builds, not Expo Go
let HealthConnect: typeof import("react-native-health-connect") | null = null;
try {
  const hasNativeModule = NativeModules && (NativeModules.HealthConnect || NativeModules.RNHealthConnect);
  if (Platform.OS === "android" && hasNativeModule) {
    HealthConnect = require("react-native-health-connect");
  }
} catch {
  // react-native-health-connect not available (e.g. running in Expo Go)
  HealthConnect = null;
}

export type StepSource = "health-connect" | "pedometer" | "unavailable";

export type HistoryItem = {
  date: string; // YYYY-MM-DD
  steps: number;
};

export type StepTrackerData = {
  steps: number;
  isAvailable: boolean;
  permissionGranted: boolean;
  loading: boolean;
  source: StepSource;
  history: HistoryItem[];
  refresh: () => Promise<void>;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
};

const withTimeout = <T,>(
  promise: Promise<T>,
  ms: number,
  fallbackValue?: T
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve, reject) =>
      setTimeout(() => {
        if (fallbackValue !== undefined) {
          resolve(fallbackValue);
        } else {
          reject(new Error(`Timeout after ${ms}ms`));
        }
      }, ms)
    ),
  ]);
};

// ─── Health Connect helpers ──────────────────────────────────────────────────

async function tryHealthConnect(): Promise<{
  available: boolean;
  granted: boolean;
}> {
  if (!HealthConnect || Platform.OS !== "android") {
    return { available: false, granted: false };
  }

  try {
    // Check if Health Connect SDK is available on device
    const status = await withTimeout(
      HealthConnect.getSdkStatus(),
      3000,
      HealthConnect.SdkAvailabilityStatus.SDK_UNAVAILABLE
    );

    if (status !== HealthConnect.SdkAvailabilityStatus.SDK_AVAILABLE) {
      return { available: false, granted: false };
    }

    // Initialize the client
    const initialized = await withTimeout(
      HealthConnect.initialize(),
      3000,
      false
    );
    if (!initialized) {
      return { available: false, granted: false };
    }

    // Request permission to read steps
    const permissions = await withTimeout(
      HealthConnect.requestPermission([
        { accessType: "read", recordType: "Steps" },
      ]),
      15000, // give user time to interact with permission dialog
      []
    );

    const granted =
      Array.isArray(permissions) &&
      permissions.some(
        (p: any) => p.recordType === "Steps" && p.accessType === "read"
      );

    return { available: true, granted };
  } catch (err) {
    console.warn("Health Connect setup failed:", err);
    return { available: false, granted: false };
  }
}

async function getStepsFromHealthConnect(
  startDate: Date,
  endDate: Date
): Promise<number> {
  if (!HealthConnect) return 0;

  try {
    const result = await withTimeout(
      HealthConnect.readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        },
      }),
      5000
    );

    if (result && Array.isArray(result.records)) {
      return result.records.reduce(
        (sum: number, record: any) => sum + (record.count || 0),
        0
      );
    }
    return 0;
  } catch (err) {
    console.warn("Health Connect readRecords failed:", err);
    return 0;
  }
}

async function getHistoryFromHealthConnect(): Promise<HistoryItem[]> {
  const items: HistoryItem[] = [];
  const today = new Date();

  for (let i = 1; i <= 6; i++) {
    const dStart = new Date(today);
    dStart.setDate(today.getDate() - i);
    dStart.setHours(0, 0, 0, 0);

    const dEnd = new Date(today);
    dEnd.setDate(today.getDate() - i);
    dEnd.setHours(23, 59, 59, 999);

    const steps = await getStepsFromHealthConnect(dStart, dEnd);
    items.push({
      date: dStart.toISOString().split("T")[0],
      steps,
    });
  }

  return items;
}

// ─── Pedometer (expo-sensors) helpers ────────────────────────────────────────

async function tryPedometer(): Promise<{
  available: boolean;
  granted: boolean;
}> {
  try {
    const available = await withTimeout(
      Pedometer.isAvailableAsync(),
      3000,
      false
    );
    if (!available) {
      return { available: false, granted: false };
    }

    let granted = false;
    if (Platform.OS === "android") {
      try {
        const has = await withTimeout(
          PermissionsAndroid.check("android.permission.ACTIVITY_RECOGNITION"),
          3000,
          false
        );
        if (has) {
          granted = true;
        } else {
          const req = await withTimeout(
            PermissionsAndroid.request(
              "android.permission.ACTIVITY_RECOGNITION",
              {
                title: "Physical Activity Permission",
                message:
                  "This app needs access to your physical activity to count your steps.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK",
              }
            ),
            15000
          );
          granted = req === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch {
        const perm = await withTimeout<any>(
          Pedometer.requestPermissionsAsync(),
          5000,
          { granted: false }
        );
        granted = perm.granted;
      }
    } else {
      const perm = await withTimeout<any>(
        Pedometer.requestPermissionsAsync(),
        5000,
        { granted: false }
      );
      granted = perm.granted;
    }

    return { available, granted };
  } catch (err) {
    console.warn("Pedometer setup failed:", err);
    return { available: false, granted: false };
  }
}

async function getStepsFromPedometer(
  startDate: Date,
  endDate: Date
): Promise<number> {
  try {
    const result = await withTimeout(
      Pedometer.getStepCountAsync(startDate, endDate),
      5000
    );
    return result.steps;
  } catch {
    return 0;
  }
}

const getIsTrackingKey = (userId?: number) =>
  userId ? `@step_tracker_is_tracking_${userId}` : "@step_tracker_is_tracking";

const getPedometerStepsKey = (dateStr: string, userId?: number) =>
  userId ? `pedometer_steps_${userId}_${dateStr}` : `pedometer_steps_${dateStr}`;

async function getHistoryFromPedometer(userId?: number): Promise<HistoryItem[]> {
  const items: HistoryItem[] = [];
  const today = new Date();

  for (let i = 1; i <= 6; i++) {
    const dStart = new Date(today);
    dStart.setDate(today.getDate() - i);
    dStart.setHours(0, 0, 0, 0);
    const dateStr = dStart.toISOString().split("T")[0];

    let steps = 0;
    let success = false;
    try {
      const dEnd = new Date(today);
      dEnd.setDate(today.getDate() - i);
      dEnd.setHours(23, 59, 59, 999);
      const systemSteps = await getStepsFromPedometer(dStart, dEnd);
      if (systemSteps > 0) {
        steps = systemSteps;
        success = true;
        await AsyncStorage.setItem(getPedometerStepsKey(dateStr, userId), steps.toString());
      }
    } catch {
      // ignore
    }

    if (!success) {
      try {
        const savedStr = await AsyncStorage.getItem(getPedometerStepsKey(dateStr, userId));
        if (savedStr) {
          steps = parseInt(savedStr, 10);
        }
      } catch {
        steps = 0;
      }
    }

    items.push({
      date: dateStr,
      steps,
    });
  }

  return items;
}

// ─── Main Hook ───────────────────────────────────────────────────────────────

const IS_TRACKING_KEY = "@step_tracker_is_tracking";

export function useStepTracker(userId?: number): StepTrackerData {

  const [steps, setSteps] = useState(0);
  const [isAvailable, setIsAvailable] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<StepSource>("unavailable");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isTracking, setIsTracking] = useState(true);

  const pedometerSub = useRef<Pedometer.Subscription | null>(null);
  const baseStepsRef = useRef(0);
  const currentStepsRef = useRef(0);
  const sourceRef = useRef<StepSource>("unavailable");
  const healthConnectPollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTracking = useCallback(() => {
    if (pedometerSub.current) {
      baseStepsRef.current = currentStepsRef.current;
      pedometerSub.current.remove();
      pedometerSub.current = null;
    }
    if (healthConnectPollingRef.current) {
      clearInterval(healthConnectPollingRef.current);
      healthConnectPollingRef.current = null;
    }
    setIsTracking(false);
    AsyncStorage.setItem(getIsTrackingKey(userId), "false").catch(() => {});
  }, [userId]);

  const startLiveHealthConnect = useCallback(() => {
    // Health Connect doesn't have a real-time listener like Pedometer.
    // We poll every 30 seconds for updated step counts.
    if (healthConnectPollingRef.current) {
      clearInterval(healthConnectPollingRef.current);
    }

    const pollSteps = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const now = new Date();
      const currentSteps = await getStepsFromHealthConnect(startOfDay, now);
      setSteps(currentSteps);
    };

    // Initial fetch
    void pollSteps();

    // Then poll every 30 seconds
    healthConnectPollingRef.current = setInterval(pollSteps, 30000);
    setIsTracking(true);
    AsyncStorage.setItem(getIsTrackingKey(userId), "true").catch(() => {});
  }, [userId]);

  const startLivePedometer = useCallback(() => {
    if (pedometerSub.current) {
      pedometerSub.current.remove();
    }

    pedometerSub.current = Pedometer.watchStepCount((result) => {
      const newTotal = baseStepsRef.current + result.steps;
      setSteps(newTotal);
      currentStepsRef.current = newTotal;
      
      const todayIso = new Date().toISOString().split('T')[0];
      AsyncStorage.setItem(getPedometerStepsKey(todayIso, userId), newTotal.toString()).catch(() => {});
    });
    setIsTracking(true);
    AsyncStorage.setItem(getIsTrackingKey(userId), "true").catch(() => {});
  }, [userId]);

  const startTracking = useCallback(() => {
    if (sourceRef.current === "health-connect") {
      startLiveHealthConnect();
    } else if (sourceRef.current === "pedometer") {
      startLivePedometer();
    }
  }, [startLiveHealthConnect, startLivePedometer]);

  const refresh = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    stopTracking();

    try {
      // Load saved tracking preference
      let trackingPref = true;
      try {
        const savedPref = await AsyncStorage.getItem(getIsTrackingKey(userId));
        if (savedPref !== null) {
          trackingPref = savedPref === "true";
        }
      } catch {}

      // ── Layer 1: Try Health Connect first ──
      const hc = await tryHealthConnect();

      if (hc.available && hc.granted) {
        setIsAvailable(true);
        setPermissionGranted(true);
        setSource("health-connect");
        sourceRef.current = "health-connect";

        // Get today's steps
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const now = new Date();
        const todaySteps = await getStepsFromHealthConnect(startOfDay, now);
        setSteps(todaySteps);

        // Get history
        const hist = await getHistoryFromHealthConnect();
        setHistory(hist);

        // Start live polling
        if (trackingPref) {
          startLiveHealthConnect();
        } else {
          setIsTracking(false);
        }
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      // ── Layer 2: Fall back to expo-sensors Pedometer ──
      const ped = await tryPedometer();

      if (ped.available && ped.granted) {
        setIsAvailable(true);
        setPermissionGranted(true);
        setSource("pedometer");
        sourceRef.current = "pedometer";

        // Get today's steps
        const todayIso = new Date().toISOString().split("T")[0];
        let todaySteps = 0;
        let success = false;
        
        try {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          const now = new Date();
          const systemSteps = await getStepsFromPedometer(startOfDay, now);
          
          if (systemSteps > 0) {
            todaySteps = systemSteps;
            success = true;
            await AsyncStorage.setItem(getPedometerStepsKey(todayIso, userId), todaySteps.toString());
          }
        } catch (err) {
          console.warn("Failed to get step count from system pedometer:", err);
        }

        if (!success) {
          try {
            const savedStr = await AsyncStorage.getItem(getPedometerStepsKey(todayIso, userId));
            if (savedStr) {
              todaySteps = parseInt(savedStr, 10);
            }
          } catch {
            todaySteps = 0;
          }
        }

        baseStepsRef.current = todaySteps;
        currentStepsRef.current = todaySteps;
        setSteps(todaySteps);

        // Get history
        const hist = await getHistoryFromPedometer(userId);
        setHistory(hist);

        // Start live listener
        if (trackingPref) {
          startLivePedometer();
        } else {
          setIsTracking(false);
        }
        if (!silent) {
          setLoading(false);
        }
        return;
      }

      // ── Neither source available ──
      setIsAvailable(false);
      setPermissionGranted(false);
      setSource("unavailable");
      sourceRef.current = "unavailable";
      setSteps(0);
      setHistory([]);
    } catch (err) {
      console.error("Step tracker refresh failed:", err);
      setSource("unavailable");
      sourceRef.current = "unavailable";
      setSteps(0);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [userId, stopTracking, startLiveHealthConnect, startLivePedometer]);

  useEffect(() => {
    void refresh();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        void refresh(true); // Silent refresh when app comes to foreground
      }
    });

    return () => {
      stopTracking();
      subscription.remove();
    };
  }, [userId, refresh, stopTracking]);

  return {
    steps,
    isAvailable,
    permissionGranted,
    loading,
    source,
    history,
    refresh,
    isTracking,
    startTracking,
    stopTracking,
  };
}
