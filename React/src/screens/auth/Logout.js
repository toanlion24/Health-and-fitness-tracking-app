// Trong src/context/AuthContext.js

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);

  // ... giữ nguyên hàm login của bạn ...

  // ĐÂY LÀ HÀM LOGOUT BẠN ĐANG THIẾU
  const logout = async () => {
    try {
      // 1. Xóa token khỏi bộ nhớ điện thoại (AsyncStorage)
      await AsyncStorage.removeItem('userToken');
      
      // 2. Cập nhật trạng thái userToken về null
      // Khi dòng này chạy, AppNavigator sẽ thấy token = null 
      // và tự động "đá" người dùng ra màn hình Login ngay lập tức.
      setUserToken(null);
      
      console.log("Đã đăng xuất và xóa Token thành công");
    } catch (e) {
      console.log("Lỗi khi đăng xuất:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ login, logout, userToken }}>
      {children}
    </AuthContext.Provider>
  );
};