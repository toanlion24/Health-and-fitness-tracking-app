import { create } from "zustand";
export type AuthState = {
  user: { email: string } | null;
  needsOnboarding: boolean;
  status: "loading" | "ready";
  hydrate: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  completeOnboarding: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  needsOnboarding: false,
  status: "loading",
  hydrate: async () => {
    set({ status: "ready", user: null, needsOnboarding: false });
  },
  register: async (email: string, password: string) => {
    void password;
    set({ user: { email }, needsOnboarding: true, status: "ready" });
  },
  login: async (email: string, password: string) => {
    void password;
    set({ user: { email }, needsOnboarding: false, status: "ready" });
  },
  completeOnboarding: () => {
    set({ needsOnboarding: false });
  },
  logout: () => {
    set({ user: null, needsOnboarding: false, status: "ready" });
  },
}));
