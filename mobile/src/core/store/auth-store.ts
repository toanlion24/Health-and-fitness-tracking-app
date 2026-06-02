import { create } from "zustand";
import * as SecureStore from 'expo-secure-store';
import { fetchApi } from "../lib/api";

export type UserProfile = {
  fullName: string | null;
  dob: string | null;        // ISO date string e.g. "1995-08-20"
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  goalType: string | null;
  activityLevel: string | null;
};

export type User = {
  id: number;
  email: string;
  profile: UserProfile | null;
};

export type AuthState = {
  user: User | null;
  needsOnboarding: boolean;
  status: "loading" | "ready";
  hydrate: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithApple: (idToken: string) => Promise<void>;
  completeOnboarding: () => void;
  logout: () => void;
  updateUser: (user: User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  needsOnboarding: false,
  status: "loading",
  
  hydrate: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (accessToken) {
        // Có token, fetch profile để xác nhận
        const res = await fetchApi('/users/me');
        if (res.ok) {
          const data = await res.json();
          // Kiểm tra xem đã có profile đầy đủ chưa (onboarding check)
          const isProfileComplete = data.profile?.gender != null;
          set({ user: data, needsOnboarding: !isProfileComplete, status: "ready" });
          return;
        } else {
          // Token không hợp lệ hoặc hết hạn
          await SecureStore.deleteItemAsync('accessToken');
          await SecureStore.deleteItemAsync('refreshToken');
        }
      }
    } catch (e) {
      console.log('Hydrate error:', e);
    }
    set({ status: "ready", user: null, needsOnboarding: false });
  },
  
  register: async (email: string, password: string) => {
    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi đăng ký');
    }
    
    const data = await res.json();
    await SecureStore.setItemAsync('accessToken', data.tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.tokens.refreshToken);
    set({ user: data.user, needsOnboarding: true, status: "ready" });
  },
  
  login: async (email: string, password: string) => {
    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi đăng nhập');
    }
    
    const data = await res.json();
    await SecureStore.setItemAsync('accessToken', data.tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.tokens.refreshToken);
    
    // Kiểm tra onboarding state bằng fetch /users/me
    const meRes = await fetchApi('/users/me');
    let needsOnboarding = false;
    if (meRes.ok) {
      const meData = await meRes.json();
      needsOnboarding = meData.profile?.gender == null;
      set({ user: meData, needsOnboarding, status: "ready" });
    } else {
      set({ user: data.user, needsOnboarding: false, status: "ready" });
    }
  },

  loginWithGoogle: async (idToken: string) => {
    const res = await fetchApi('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi đăng nhập Google');
    }

    const data = await res.json();
    await SecureStore.setItemAsync('accessToken', data.tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.tokens.refreshToken);

    const meRes = await fetchApi('/users/me');
    let needsOnboarding = false;
    if (meRes.ok) {
      const meData = await meRes.json();
      needsOnboarding = meData.profile?.gender == null;
      set({ user: meData, needsOnboarding, status: "ready" });
    } else {
      set({ user: data.user, needsOnboarding: false, status: "ready" });
    }
  },

  loginWithApple: async (idToken: string) => {
    const res = await fetchApi('/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi đăng nhập Apple');
    }

    const data = await res.json();
    await SecureStore.setItemAsync('accessToken', data.tokens.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.tokens.refreshToken);

    const meRes = await fetchApi('/users/me');
    let needsOnboarding = false;
    if (meRes.ok) {
      const meData = await meRes.json();
      needsOnboarding = meData.profile?.gender == null;
      set({ user: meData, needsOnboarding, status: "ready" });
    } else {
      set({ user: data.user, needsOnboarding: false, status: "ready" });
    }
  },

  
  completeOnboarding: () => {
    set({ needsOnboarding: false });
  },
  
  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (refreshToken) {
        await fetchApi('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (e) {
      console.log('Logout error', e);
    }
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, needsOnboarding: false, status: "ready" });
  },
  
  updateUser: (user: User) => {
    set({ user });
  },
}));
