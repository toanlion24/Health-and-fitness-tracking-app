import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { initDB, getDailyStats, saveDailyStats } from '../../database/db';
import CachedImage from '../../components/CachedImage';
import Slider from '@react-native-community/slider';
import { Accelerometer } from 'expo-sensors';

export default function HomeScreen() {
  // Stats States
  const [steps, setSteps] = useState(0);
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState("--");
  const [bmi, setBmi] = useState("--");

  // Step Tracking States
  const [isTracking, setIsTracking] = useState(false);
  const accelerometerSubscription = useRef(null);

  // Advanced Algorithm Refs
  const gX = useRef(0);
  const gY = useRef(0);
  const gZ = useRef(0);
  const smoothedMag = useRef(0); // Dùng cho gia tốc dọc (dynamic vertical)
  const lastMag = useRef(0);
  const isGoingUp = useRef(false);
  const consecutiveSteps = useRef(0);
  const lastStepTime = useRef(0);

  // Constants for Step Detection
  const GRAVITY_ALPHA = 0.8; // Hằng số lọc Low-pass để tách trọng lực
  const DYNAMIC_ALPHA = 0.3; // Hằng số lọc làm mượt gia tốc chuyển động
  const THRESHOLD_MIN = 0.08; // Ngưỡng gia tốc dọc tối thiểu (g)
  const THRESHOLD_MAX = 1.0; // Ngưỡng gia tốc dọc tối đa (loại bỏ nhảy múa/sốc mạnh)
  const MIN_STEP_INTERVAL = 300; // Tăng lại độ nhạy nhịp độ một chút vì ta đã lọc ngang
  const MAX_STEP_INTERVAL = 1200; // Độ trễ tối đa giữa các bước
  const MIN_CONSECUTIVE_STEPS = 4; // Cần 4 bước liên tiếp

  // Modal States
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [tempWater, setTempWater] = useState(0);

  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [bedTime, setBedTime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("06:00");

  const [bmiModalVisible, setBmiModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const updateStat = async (key, value) => {
    const today = getTodayDate();
    await saveDailyStats(today, { [key]: value });
  };

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        await initDB();
        const today = getTodayDate();
        const stats = await getDailyStats(today);

        if (stats) {
          setSteps(stats.steps);
          setWater(stats.water);
          setSleep(stats.sleep);
          setBmi(stats.bmi);
        }
      } catch (e) {
        console.log("Error loading data:", e);
      }
    };
    loadData();

    // Cleanup on unmount
    return () => {
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
      }
    };
  }, []);

  // --- STEPS TRACKING ---
  const toggleTracking = async () => {
    if (isTracking) {
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
        accelerometerSubscription.current = null;
      }
      setIsTracking(false);
    } else {
      setIsTracking(true);

      // Tốc độ lấy mẫu nhanh hơn (50ms = 20Hz) để bắt đỉnh đồ thị chính xác
      Accelerometer.setUpdateInterval(50);

      // Reset variables
      gX.current = 0; gY.current = 0; gZ.current = 0;
      smoothedMag.current = 0;
      lastMag.current = 0;
      isGoingUp.current = false;
      consecutiveSteps.current = 0;
      lastStepTime.current = Date.now();

      accelerometerSubscription.current = Accelerometer.addListener(data => {
        const { x, y, z } = data;

        // 1. Tách vector Trọng Lực (Gravity Vector) bằng Low-pass filter
        if (gX.current === 0 && gY.current === 0 && gZ.current === 0) {
          gX.current = x; gY.current = y; gZ.current = z;
        } else {
          gX.current = GRAVITY_ALPHA * gX.current + (1 - GRAVITY_ALPHA) * x;
          gY.current = GRAVITY_ALPHA * gY.current + (1 - GRAVITY_ALPHA) * y;
          gZ.current = GRAVITY_ALPHA * gZ.current + (1 - GRAVITY_ALPHA) * z;
        }

        const gMag = Math.sqrt(gX.current * gX.current + gY.current * gY.current + gZ.current * gZ.current);
        if (gMag === 0) return;

        // 2. Chiếu gia tốc hiện tại lên vector trọng lực (Dot Product)
        // LOẠI BỎ chuyển động ngang. Chỉ giữ lại dao động DỌC.
        const verticalAccel = (x * gX.current + y * gY.current + z * gZ.current) / gMag;

        // 3. Loại bỏ trọng lực cốt lõi để ra gia tốc dao động dọc thuần túy
        const dynamicVertical = verticalAccel - gMag;

        // Làm mượt gia tốc dọc
        smoothedMag.current = (1 - DYNAMIC_ALPHA) * smoothedMag.current + DYNAMIC_ALPHA * dynamicVertical;

        // 4. Thuật toán tìm đỉnh (Peak Detection) trên trục dọc
        const delta = smoothedMag.current - lastMag.current;

        if (delta > 0.005) {
          isGoingUp.current = true;
        } else if (delta < -0.005 && isGoingUp.current) {
          isGoingUp.current = false;

          if (smoothedMag.current > THRESHOLD_MIN && smoothedMag.current < THRESHOLD_MAX) {
            const now = Date.now();
            const timeSinceLast = now - lastStepTime.current;

            if (timeSinceLast > MIN_STEP_INTERVAL && timeSinceLast < MAX_STEP_INTERVAL) {
              consecutiveSteps.current += 1;
              lastStepTime.current = now;

              if (consecutiveSteps.current >= MIN_CONSECUTIVE_STEPS) {
                const stepsToAdd = consecutiveSteps.current === MIN_CONSECUTIVE_STEPS ? MIN_CONSECUTIVE_STEPS : 1;

                setSteps(prev => {
                  const updated = prev + stepsToAdd;
                  updateStat('steps', updated);
                  return updated;
                });
              }
            } else if (timeSinceLast > MAX_STEP_INTERVAL) {
              consecutiveSteps.current = 1;
              lastStepTime.current = now;
            }
          } else if (smoothedMag.current >= THRESHOLD_MAX) {
            consecutiveSteps.current = 0;
          }
        }

        lastMag.current = smoothedMag.current;
      });
    }
  };

  // --- WATER ---
  const saveWater = async () => {
    setWater(tempWater);
    await updateStat('water', tempWater);
    setWaterModalVisible(false);
  };

  // --- SLEEP ---
  const calculateSleep = async () => {
    // Basic time math (assuming HH:mm format)
    try {
      const [bH, bM] = bedTime.split(':').map(Number);
      const [wH, wM] = wakeTime.split(':').map(Number);

      let sleepMinutes = (wH * 60 + wM) - (bH * 60 + bM);
      if (sleepMinutes < 0) sleepMinutes += 24 * 60; // Crosses midnight

      const hours = Math.floor(sleepMinutes / 60);
      const mins = sleepMinutes % 60;

      const sleepStr = `${hours}h ${mins}m`;
      setSleep(sleepStr);
      await updateStat('sleep', sleepStr);
      setSleepModalVisible(false);
    } catch (e) {
      Alert.alert("Lỗi", "Vui lòng nhập đúng định dạng HH:mm");
    }
  };

  // --- BMI ---
  const calculateBmi = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // convert cm to m
    if (w > 0 && h > 0) {
      const bmiValue = (w / (h * h)).toFixed(1);
      setBmi(bmiValue);
      await updateStat('bmi', bmiValue);
      setBmiModalVisible(false);
    } else {
      Alert.alert("Lỗi", "Vui lòng nhập chiều cao và cân nặng hợp lệ.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Trang chủ</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-sharp" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.userInfoContainer}>
          <View>
            <Text style={styles.greeting}>Chào bạn, chúc một ngày tốt lành! 👋</Text>
            <Text style={styles.mainTitle}>Chỉ số hôm nay</Text>
          </View>
          <CachedImage
            source={{ uri: 'https://i.pravatar.cc/150?img=68' }}
            style={styles.avatar}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        {/* Steps Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#1C252E' }]}
          onPress={toggleTracking}
        >
          <Ionicons name="walk" size={32} color={isTracking ? "#4caf50" : "#3498db"} />
          <Text style={styles.cardValue}>{steps.toLocaleString()}</Text>
          <Text style={styles.cardLabel}>Bước chân</Text>
          <Text style={[styles.subLabel, { color: isTracking ? "#4caf50" : "#888" }]}>
            {isTracking ? "Đang theo dõi..." : "Chạm để theo dõi"}
          </Text>
        </TouchableOpacity>

        {/* BMI Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#2D1F24' }]}
          onPress={() => setBmiModalVisible(true)}
        >
          <Ionicons name="body" size={32} color="#e91e63" />
          <Text style={styles.cardValue}>{bmi}</Text>
          <Text style={styles.cardLabel}>Chỉ số BMI</Text>
        </TouchableOpacity>

        {/* Water Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#1A2A2D' }]}
          onPress={() => { setTempWater(water); setWaterModalVisible(true); }}
        >
          <Ionicons name="water" size={32} color="#00bcd4" />
          <Text style={styles.cardValue}>{water.toFixed(1)}L / 2L</Text>
          <Text style={styles.cardLabel}>Nước uống</Text>
        </TouchableOpacity>

        {/* Sleep Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#2D261E' }]}
          onPress={() => setSleepModalVisible(true)}
        >
          <Ionicons name="moon" size={32} color="#ff9800" />
          <Text style={styles.cardValue}>{sleep}</Text>
          <Text style={styles.cardLabel}>Giấc ngủ</Text>
        </TouchableOpacity>
      </View>

      {/* MODALS */}
      {/* Water Modal */}
      <Modal animationType="slide" transparent={true} visible={waterModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thiết lập lượng nước</Text>
            <Text style={styles.waterDisplay}>{tempWater.toFixed(1)} Lít</Text>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0} maximumValue={2} step={0.1}
              value={tempWater} onValueChange={setTempWater}
              minimumTrackTintColor="#00bcd4" maximumTrackTintColor="#555" thumbTintColor="#00bcd4"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setWaterModalVisible(false)}>
                <Text style={{ color: '#aaa' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={saveWater}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sleep Modal */}
      <Modal animationType="slide" transparent={true} visible={sleepModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thời gian ngủ</Text>
            <Text style={styles.label}>Giờ đi ngủ (HH:mm)</Text>
            <TextInput style={styles.input} value={bedTime} onChangeText={setBedTime} keyboardType="numbers-and-punctuation" />
            <Text style={styles.label}>Giờ thức dậy (HH:mm)</Text>
            <TextInput style={styles.input} value={wakeTime} onChangeText={setWakeTime} keyboardType="numbers-and-punctuation" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSleepModalVisible(false)}>
                <Text style={{ color: '#aaa' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#ff9800' }]} onPress={calculateSleep}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* BMI Modal */}
      <Modal animationType="slide" transparent={true} visible={bmiModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tính BMI</Text>
            <Text style={styles.label}>Cân nặng (kg)</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Ví dụ: 65" />
            <Text style={styles.label}>Chiều cao (cm)</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="Ví dụ: 170" />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBmiModalVisible(false)}>
                <Text style={{ color: '#aaa' }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#e91e63' }]} onPress={calculateBmi}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tính toán</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  settingsBtn: { backgroundColor: '#333', padding: 8, borderRadius: 20 },
  userInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25 },
  greeting: { fontSize: 15, color: '#888' },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#3498db' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 15 },
  card: {
    width: '47%', paddingVertical: 25, paddingHorizontal: 15, borderRadius: 24, marginBottom: 15, alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5
  },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  cardLabel: { fontSize: 13, color: '#888', marginTop: 4 },
  subLabel: { fontSize: 10, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#1E1E1E', borderRadius: 20, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#fff', fontSize: 18, marginBottom: 20 },
  waterDisplay: { color: '#00bcd4', fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  label: { color: '#bbb', alignSelf: 'flex-start', marginTop: 10, marginBottom: 5 },
  input: { width: '100%', backgroundColor: '#333', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', marginTop: 20, width: '100%', justifyContent: 'space-between' },
  cancelBtn: { padding: 12, width: '45%', alignItems: 'center' },
  confirmBtn: { backgroundColor: '#00bcd4', padding: 12, borderRadius: 10, width: '45%', alignItems: 'center' }
});