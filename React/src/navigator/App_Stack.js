import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import MainTab from './MainTab';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  // Biến giả lập trạng thái đăng nhập
  // Sau này sẽ lấy từ AsyncStorage hoặc Global State
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        // Nhóm màn hình khi CHƯA đăng nhập
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      ) : (
        // Nhóm màn hình khi ĐÃ đăng nhập
        <Stack.Screen name="Main" component={MainTab} />
      )}
    </Stack.Navigator>
  );
}