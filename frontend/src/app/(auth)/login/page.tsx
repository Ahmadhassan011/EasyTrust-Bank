"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { easeOut } from "@/components/ui/animations";
import { Input } from "@/components/ui/form-field";
import { Landmark, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react";
import type { LoginResponse, ApiResponse } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", {
        identifier,
        password,
      });

      if (data.data.requiresMfa) {
        setMfaToken(data.data.mfaToken ?? "");
        return;
      }

      login(data.data.user, {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      router.push("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMfa(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/mfa/verify", {
        mfaToken,
        code: mfaCode,
      });

      login(data.data.user, {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      router.push("/dashboard");
    } catch {
      setError("Invalid MFA code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}       transition={{ duration: 0.5, ease: easeOut }}
      className="w-full max-w-md">
      <div className="card-premium p-8">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 shadow-lg shadow-navy-900/10">
            <LogIn className="h-5 w-5 text-white" />
          </motion.div>
          <h1 className="mt-5 text-2xl font-bold text-navy-900">
            {mfaToken ? "Two-Factor Auth" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm text-navy-500">
            {mfaToken ? "Enter the code from your authenticator app." : "Sign in to your EasyTrust account."}
          </p>
        </div>

        <form onSubmit={mfaToken ? handleMfa : handleLogin} className="mt-8 space-y-5">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {!mfaToken ? (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-700">
                  <Landmark className="mr-1.5 inline h-3.5 w-3.5 text-navy-400" />
                  Email or CNIC
                </label>
                <Input type="text" required value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or 12345-6789012-3"
                  autoFocus />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-700">
                  Password
                </label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">
                Authentication Code
              </label>
              <Input type="text" required value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                autoFocus />
            </div>
          )}

          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10">
            {loading ? "Signing in..." : mfaToken ? "Verify Code" : "Sign In"}
          </motion.button>

          {!mfaToken && (
            <p className="text-center text-sm text-navy-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-navy-900 hover:text-navy-700 transition-colors">
                Create one
              </Link>
            </p>
          )}
        </form>
      </div>
    </motion.div>
  );
}
