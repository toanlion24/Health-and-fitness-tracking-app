import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { Pedometer } from 'expo-sensors';

export default function HomeScreen() {
  // Stats States
  const [steps, setSteps] = useState(0);
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState("--");
  const [bmi, setBmi] = useState("--");

  // Step Tracking States
  const [isTracking, setIsTracking] = useState(false);
  const pedometerSubscription = useRef(null);
  const sessionStartSteps = useRef(0);

  // Modal States
  const [waterModalVisible, setWaterModalVisible] = useState(false);
  const [tempWater, setTempWater] = useState(0);

  const [sleepModalVisible, setSleepModalVisible] = useState(false);
  const [bedTime, setBedTime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("06:00");

  const [bmiModalVisible, setBmiModalVisible] = useState(false);
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedSteps = await AsyncStorage.getItem('steps');
        const savedWater = await AsyncStorage.getItem('water');
        const savedSleep = await AsyncStorage.getItem('sleep');
        const savedBmi = await AsyncStorage.getItem('bmi');

        if (savedSteps) setSteps(parseInt(savedSteps));
        if (savedWater) setWater(parseFloat(savedWater));
        if (savedSleep) setSleep(savedSleep);
        if (savedBmi) setBmi(savedBmi);
      } catch (e) {
        console.log("Error loading data:", e);
      }
    };
    loadData();

    // Cleanup on unmount
    return () => {
      if (pedometerSubscription.current) {
        pedometerSubscription.current.remove();
      }
    };
  }, []);

  // --- STEPS TRACKING ---
  const toggleTracking = async () => {
    if (isTracking) {
      if (pedometerSubscription.current) {
        pedometerSubscription.current.remove();
        pedometerSubscription.current = null;
      }
      setIsTracking(false);
    } else {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Không hỗ trợ', 'Thiết bị của bạn không hỗ trợ cảm biến đếm bước chân.');
        return;
      }

      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền bị từ chối', 'Ứng dụng cần quyền hoạt động thể chất để đếm số bước chân.');
        return;
      }

      setIsTracking(true);
      sessionStartSteps.current = steps;

      pedometerSubscription.current = Pedometer.watchStepCount(result => {
        const updatedSteps = sessionStartSteps.current + result.steps;
        setSteps(updatedSteps);
        AsyncStorage.setItem('steps', updatedSteps.toString());
      });
    }
  };

  // --- WATER ---
  const saveWater = async () => {
    setWater(tempWater);
    await AsyncStorage.setItem('water', tempWater.toString());
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
      await AsyncStorage.setItem('sleep', sleepStr);
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
      await AsyncStorage.setItem('bmi', bmiValue);
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
        <Text style={styles.greeting}>Chào bạn, chúc một ngày tốt lành! 👋</Text>
        <Text style={styles.mainTitle}>Chỉ số hôm nay</Text>
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
  greeting: { fontSize: 15, color: '#888', marginTop: 25 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 8 },
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