import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { logout } = useContext(AuthContext); // Lấy hàm logout từ Context

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={60} color="#fff" />
        </View>
        <Text style={styles.userName}>Admin User</Text>
        <Text style={styles.userEmail}>admin@gmail.com</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Cài đặt tài khoản</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Thông báo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutBtn]} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#FF5252" />
          <Text style={[styles.menuText, { color: '#FF5252' }]}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileHeader: { alignItems: 'center', padding: 40, borderBottomWidth: 1, borderBottomColor: '#eee' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#2e7d32', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#666' },
  menu: { padding: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f9f9f9' },
  menuText: { fontSize: 16, marginLeft: 15 },
  logoutBtn: { marginTop: 30, borderBottomWidth: 0 }
});