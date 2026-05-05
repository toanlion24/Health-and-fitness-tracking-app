import React, { createContext, useState, useContext, useEffect } from "react"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
        }
      } catch (e) {
        console.log("Lỗi load token:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const register = async (email, password) => {
    try {
      const user = { email, password };
      await AsyncStorage.setItem('registeredUser', JSON.stringify(user));
      Alert.alert("Thành công", "Tài khoản đã được tạo! Vui lòng đăng nhập.");
      return true;
    } catch (e) {
      console.log("Lỗi đăng ký:", e);
      Alert.alert("Lỗi", "Không thể đăng ký tài khoản");
      return false;
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const savedUserStr = await AsyncStorage.getItem('registeredUser');
      let savedUser = null;
      if (savedUserStr) {
        savedUser = JSON.parse(savedUserStr);
      }

      if ((savedUser && email === savedUser.email && password === savedUser.password) || 
          (email === "admin@gmail.com" && password === "123456")) {
        const token = "user-secret-token-123";
        await AsyncStorage.setItem('userToken', token);
        setUserToken(token);
      } else {
        Alert.alert("Thất bại", "Email hoặc mật khẩu không chính xác!");
      }
    } catch (e) {
      console.log("Lỗi đăng nhập:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ login, register, logout, userToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};