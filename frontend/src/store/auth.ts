import { create } from "zustand";
import type { User, AuthTokens } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  setTokens: (tokens: AuthTokens) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  login: (user, tokens) => {
    const auth = { user, ...tokens };
    localStorage.setItem("auth", JSON.stringify(auth));
    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("auth");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  setTokens: (tokens) => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      const auth = { ...JSON.parse(stored), ...tokens };
      localStorage.setItem("auth", JSON.stringify(auth));
    }
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  },

  hydrate: () => {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const { user, accessToken, refreshToken } = JSON.parse(stored);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      }
    } catch {
      localStorage.removeItem("auth");
    }
  },
}));
