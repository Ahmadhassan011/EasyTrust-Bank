"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { easeOut } from "@/components/ui/animations";
import { Input } from "@/components/ui/form-field";
import { Landmark, LogIn, Eye, EyeOff, AlertCircle, X } from "lucide-react";
import type { LoginResponse, ApiResponse, User } from "@/types";

function normalizeUser(data: LoginResponse): User {
  return {
    userId: data.user.customer_id ?? data.user.employee_id ?? 0,
    type: data.role === "CUSTOMER" ? "customer" : "employee",
    role: data.role,
    firstName: data.user.first_name,
    lastName: data.user.last_name,
    email: data.user.email,
  };
}

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

      login(normalizeUser(data.data), {
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

      login(normalizeUser(data.data), {
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
      <div className="card-easytrust p-8 relative">
        <Link
          href="/"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all"
          aria-label="Close and return to home"
        >
          <X className="h-4 w-4" />
        </Link>
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
            <LogIn className="h-5 w-5 text-white" />
          </motion.div>
          <h1 className="mt-5 text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
            {mfaToken ? "Two-Factor Auth" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mfaToken ? "Enter the code from your authenticator app." : "Sign in to your EasyTrust account."}
          </p>
        </div>

        <form onSubmit={mfaToken ? handleMfa : handleLogin} className="mt-8 space-y-5">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {!mfaToken ? (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  <Landmark className="mr-1.5 inline h-3.5 w-3.5 text-muted-foreground" />
                  Email or CNIC
                </label>
                <Input type="text" required value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or 12345-6789012-3"
                  autoFocus />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
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
            className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
            {loading ? "Signing in..." : mfaToken ? "Verify Code" : "Sign In"}
          </motion.button>

          {!mfaToken && (
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-foreground hover:text-primary transition-colors">
                Create one
              </Link>
            </p>
          )}
        </form>
      </div>
    </motion.div>
  );
}
