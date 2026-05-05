import React, { useState, useContext } from 'react'; 
import { AuthContext } from '../../context/AuthContext';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Lấy hàm login từ AuthContext
  const { login } = useContext(AuthContext); 
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      await login(email, password); 
      console.log("Đã thực hiện yêu cầu đăng nhập với:", email);
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra sự cố khi đăng nhập");
    }
  };

  // CHỈ CÓ 1 LỆNH RETURN DUY NHẤT
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>HealthCare 🏥</Text>
      <Text style={styles.subtitle}>Theo dõi sức khỏe & Tập luyện</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </View>
  );
} // <--- KẾT THÚC HÀM LOGINSCREEN TẠI ĐÂY

// KHAI BÁO STYLES NẰM NGOÀI HÀM
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  logo: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#402e7d' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, color: '#666666' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#2e7d32', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#2e7d79', textAlign: 'center', marginTop: 20, fontSize: 14 }
});