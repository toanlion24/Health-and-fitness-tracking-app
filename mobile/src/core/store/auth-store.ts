import { create } from "zustand";
import type {
  AuthUserDto,
  LoginResponseDto,
  MeResponseDto,
  RegisterResponseDto,
} from "@health-fitness/shared";
import { bindAuthSessionHandlers } from "../api/auth-bridge";
import { apiFetch } from "../api/client";
import { getTokens, saveTokens, clearTokens } from "../storage/secure-store";

export type AuthState = {
  user: AuthUserDto | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: "loading" | "ready" | "error";
  errorMessage: string | null;
  hydrate: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  status: "loading",
  errorMessage: null,

  hydrate: async () => {
    set({ status: "loading", errorMessage: null });
    const { accessToken, refreshToken } = await getTokens();
    if (!accessToken || !refreshToken) {
      set({ status: "ready", user: null, accessToken: null, refreshToken: null });
      return;
    }
    set({ accessToken, refreshToken });
    try {
      const me = await apiFetch<MeResponseDto>("/api/v1/me", { auth: true });
      set({
        user: { id: me.id, email: me.email, status: me.status },
        status: "ready",
      });
    } catch {
      await clearTokens();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        status: "ready",
      });
    }
  },

  register: async (email: string, password: string) => {
    set({ status: "loading", errorMessage: null });
    try {
      const res = await apiFetch<RegisterResponseDto>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await saveTokens(res.tokens.accessToken, res.tokens.refreshToken);
      set({
        user: res.user,
        accessToken: res.tokens.accessToken,
        refreshToken: res.tokens.refreshToken,
        status: "ready",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      set({ status: "error", errorMessage: message });
      throw err;
    }
  },

  login: async (email: string, password: string) => {
    set({ status: "loading", errorMessage: null });
    try {
      const res = await apiFetch<LoginResponseDto>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await saveTokens(res.tokens.accessToken, res.tokens.refreshToken);
      set({
        user: res.user,
        accessToken: res.tokens.accessToken,
        refreshToken: res.tokens.refreshToken,
        status: "ready",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      set({ status: "error", errorMessage: message });
      throw err;
    }
  },

  logout: async () => {
    const { accessToken, refreshToken } = get();
    if (accessToken && refreshToken) {
      try {
        await apiFetch("/api/v1/auth/logout", {
          method: "POST",
          auth: true,
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // ignore network errors on logout
      }
    }
    await clearTokens();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: "ready",
      errorMessage: null,
    });
  },
}));

bindAuthSessionHandlers({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  commitTokens: async (accessToken, refreshToken) => {
    await saveTokens(accessToken, refreshToken);
    useAuthStore.setState({ accessToken, refreshToken });
  },
});
