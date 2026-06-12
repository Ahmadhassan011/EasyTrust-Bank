"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import type { LoginResponse } from "@/types";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    hydrate,
  } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function loginWithCredentials(identifier: string, password: string) {
    const { data: res } = await api.post<LoginResponse>("/auth/login", {
      identifier,
      password,
    });

    if (res.requiresMfa) {
      return { mfaToken: res.mfaToken };
    }

    const tokens = {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
    login(res.user, tokens);
    router.push("/dashboard");
    return {};
  }

  async function loginWithMfa(mfaToken: string, totpCode: string) {
    const { data: res } = await api.post<LoginResponse>("/auth/mfa/login", {
      mfaToken,
      totpCode,
    });

    const tokens = {
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };
    login(res.user, tokens);
    router.push("/dashboard");
  }

  async function register(
    firstName: string,
    lastName: string,
    email: string,
    cnic: string,
    password: string,
    phone?: string,
  ) {
    await api.post("/auth/register", {
      first_name: firstName,
      last_name: lastName,
      email,
      cnic: cnic.replace(/-/g, ""),
      password,
      phone,
    });
    return true;
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return {
    user,
    isAuthenticated,
    loginWithCredentials,
    loginWithMfa,
    register,
    logout: handleLogout,
  };
}
