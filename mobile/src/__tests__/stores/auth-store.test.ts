import { describe, expect, it, beforeEach } from "vitest";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "../../core/store/auth-store";

const mockSecureStore = SecureStore as {
  getItemAsync: jest.Mock;
  setItemAsync: jest.Mock;
  deleteItemAsync: jest.Mock;
};

const mockFetch = global.fetch as jest.Mock;

function setupFetch(data: unknown, ok = true, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(data),
  });
}

describe("Auth Store", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    mockSecureStore.setItemAsync.mockResolvedValue(undefined);
    mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);
  });

  describe("initial state", () => {
    it("starts with null user, no onboarding needed, and loading status", () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.needsOnboarding).toBe(false);
      expect(state.status).toBe("loading");
    });
  });

  describe("hydrate", () => {
    it("sets user and ready status when token exists and /me succeeds", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue("valid-access-token");
      setupFetch({
        id: 1,
        email: "test@example.com",
        profile: { gender: "male" },
      });

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.status).toBe("ready");
      expect(state.user?.id).toBe(1);
      expect(state.needsOnboarding).toBe(false);
    });

    it("sets needsOnboarding true when profile is incomplete", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue("valid-access-token");
      setupFetch({
        id: 1,
        email: "test@example.com",
        profile: null,
      });

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.needsOnboarding).toBe(true);
    });

    it("clears tokens and sets ready when token is invalid", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue("expired-token");
      setupFetch({ message: "Unauthorized" }, false, 401);

      await useAuthStore.getState().hydrate();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("accessToken");
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("refreshToken");
      expect(useAuthStore.getState().status).toBe("ready");
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("sets ready with null user when no token stored", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      await useAuthStore.getState().hydrate();

      const state = useAuthStore.getState();
      expect(state.status).toBe("ready");
      expect(state.user).toBeNull();
    });
  });

  describe("register", () => {
    it("registers user, saves tokens, and sets needsOnboarding true", async () => {
      setupFetch({
        user: { id: 2, email: "new@example.com" },
        tokens: { accessToken: "access", refreshToken: "refresh" },
      });

      await useAuthStore.getState().register("new@example.com", "password123");

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("accessToken", "access");
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("refreshToken", "refresh");
      expect(useAuthStore.getState().user?.email).toBe("new@example.com");
      expect(useAuthStore.getState().needsOnboarding).toBe(true);
    });

    it("throws error when registration fails", async () => {
      setupFetch({ message: "Email already taken" }, false, 409);

      await expect(
        useAuthStore.getState().register("existing@example.com", "password"),
      ).rejects.toThrow("Email already taken");
    });
  });

  describe("login", () => {
    it("logs in, saves tokens, fetches profile, sets needsOnboarding based on profile", async () => {
      setupFetch({
        user: { id: 1, email: "test@example.com" },
        tokens: { accessToken: "access", refreshToken: "refresh" },
      });
      setupFetch({
        id: 1,
        email: "test@example.com",
        profile: { gender: "female" },
        goals: [{ isActive: true }],
      });

      await useAuthStore.getState().login("test@example.com", "password");

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("accessToken", "access");
      expect(useAuthStore.getState().user?.email).toBe("test@example.com");
      expect(useAuthStore.getState().needsOnboarding).toBe(false);
    });

    it("sets needsOnboarding true when profile is incomplete", async () => {
      setupFetch({
        user: { id: 1, email: "test@example.com" },
        tokens: { accessToken: "access", refreshToken: "refresh" },
      });
      setupFetch({
        id: 1,
        email: "test@example.com",
        profile: null,
      });

      await useAuthStore.getState().login("test@example.com", "password");

      expect(useAuthStore.getState().needsOnboarding).toBe(true);
    });

    it("throws error when login fails", async () => {
      setupFetch({ message: "Invalid credentials" }, false, 401);

      await expect(
        useAuthStore.getState().login("bad@example.com", "wrong"),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("loginWithGoogle", () => {
    it("logs in with Google token and saves tokens", async () => {
      setupFetch({
        user: { id: 3, email: "google@example.com" },
        tokens: { accessToken: "google-access", refreshToken: "google-refresh" },
      });
      setupFetch({
        id: 3,
        email: "google@example.com",
        profile: { gender: null },
      });

      await useAuthStore.getState().loginWithGoogle("google-id-token");

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("accessToken", "google-access");
      expect(useAuthStore.getState().user?.id).toBe(3);
    });
  });

  describe("loginWithApple", () => {
    it("logs in with Apple token and saves tokens", async () => {
      setupFetch({
        user: { id: 4, email: "apple@example.com" },
        tokens: { accessToken: "apple-access", refreshToken: "apple-refresh" },
      });
      setupFetch({
        id: 4,
        email: "apple@example.com",
        profile: { gender: null },
      });

      await useAuthStore.getState().loginWithApple("apple-id-token");

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith("accessToken", "apple-access");
      expect(useAuthStore.getState().user?.id).toBe(4);
    });
  });

  describe("completeOnboarding", () => {
    it("sets needsOnboarding to false", () => {
      useAuthStore.setState({ needsOnboarding: true });

      useAuthStore.getState().completeOnboarding();

      expect(useAuthStore.getState().needsOnboarding).toBe(false);
    });
  });

  describe("logout", () => {
    it("clears tokens and resets user state", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue("refresh-token");
      setupFetch({}, true, 200);

      useAuthStore.setState({
        user: { id: 1, email: "test@example.com", profile: null },
        needsOnboarding: false,
        status: "ready",
      });

      await useAuthStore.getState().logout();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("accessToken");
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("refreshToken");
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().needsOnboarding).toBe(false);
    });

    it("clears tokens even if API call fails", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue("refresh-token");
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      useAuthStore.setState({
        user: { id: 1, email: "test@example.com", profile: null },
        status: "ready",
      });

      await useAuthStore.getState().logout();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith("accessToken");
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("does not throw when no refresh token exists", async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      useAuthStore.setState({
        user: { id: 1, email: "test@example.com", profile: null },
        status: "ready",
      });

      await expect(useAuthStore.getState().logout()).resolves.toBeUndefined();
    });
  });

  describe("updateUser", () => {
    it("updates user state", () => {
      useAuthStore.setState({
        user: { id: 1, email: "old@example.com", profile: null },
      });

      useAuthStore.getState().updateUser({
        id: 1,
        email: "updated@example.com",
        profile: { gender: "male" },
      });

      expect(useAuthStore.getState().user?.email).toBe("updated@example.com");
      expect(useAuthStore.getState().user?.profile?.gender).toBe("male");
    });
  });
});
