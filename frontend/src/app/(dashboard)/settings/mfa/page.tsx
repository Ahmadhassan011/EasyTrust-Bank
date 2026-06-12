"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import QRCode from "qrcode";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { FadeIn } from "@/components/ui/animations";
import { Input } from "@/components/ui/form-field";
import { ShieldCheck, ArrowLeft, Smartphone, Copy, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";

type Step = "idle" | "setup" | "verify_enable" | "verify_disable" | "success";

export default function MfaPage() {
  const user = useAuthStore((s) => s.user);
  const [step, setStep] = useState<Step>("idle");
  const [secret, setSecret] = useState("");
  const [uri, setUri] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isEnabled = (user as any)?.mfa_enabled === true;

  const generateQr = async (u: string) => {
    try {
      const url = await QRCode.toDataURL(u, { width: 200, margin: 2, color: { dark: "#1e2a44", light: "#ffffff" } });
      setQrDataUrl(url);
    } catch {
      setQrDataUrl("");
    }
  };

  const handleSetup = async () => {
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/mfa/setup");
      setSecret(data.data.secret);
      setUri(data.data.uri);
      await generateQr(data.data.uri);
      setStep("setup");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to setup MFA");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    setError("");
    if (totpCode.length !== 6) { setError("Enter a 6-digit code"); return; }
    setLoading(true);
    try {
      await api.post("/auth/mfa/enable", { secret, totpCode });
      setStep("success");
      setMessage("MFA has been enabled");
      const stored = localStorage.getItem("auth");
      if (stored) {
        const auth = JSON.parse(stored);
        auth.user.mfa_enabled = true;
        localStorage.setItem("auth", JSON.stringify(auth));
        useAuthStore.setState({ user: auth.user });
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to enable MFA");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setError("");
    if (totpCode.length !== 6) { setError("Enter a 6-digit code"); return; }
    setLoading(true);
    try {
      await api.post("/auth/mfa/disable", { totpCode });
      setStep("success");
      setMessage("MFA has been disabled");
      const stored = localStorage.getItem("auth");
      if (stored) {
        const auth = JSON.parse(stored);
        auth.user.mfa_enabled = false;
        localStorage.setItem("auth", JSON.stringify(auth));
        useAuthStore.setState({ user: auth.user });
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to disable MFA");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setStep("idle");
    setSecret("");
    setUri("");
    setQrDataUrl("");
    setTotpCode("");
    setError("");
    setMessage("");
  };

  if (!user || user.type !== "employee") {
    return (
      <FadeIn>
        <div className="card-premium p-16 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-navy-200" />
          <p className="mt-4 text-sm text-navy-500">MFA is only available for employee accounts.</p>
          <Link href="/settings" className="mt-4 inline-block text-sm font-semibold text-navy-900 hover:text-navy-700">&larr; Back to Settings</Link>
        </div>
      </FadeIn>
    );
  }

  if (step === "success") {
    return (
      <div className="space-y-8">
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
          <ArrowLeft className="h-4 w-4" /> Settings
        </Link>
        <FadeIn>
          <div className="card-premium p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-navy-900 mb-2">{message}</h2>
            <p className="text-sm text-navy-400 mb-6">Your security settings have been updated.</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={reset} className="rounded-xl bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition-all">
              Done
            </motion.button>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
        <ArrowLeft className="h-4 w-4" /> Settings
      </Link>

      <FadeIn>
        <div className="card-premium p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-700">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Multi-Factor Authentication</h1>
              <p className="text-sm text-navy-400">
                {isEnabled ? "MFA is currently enabled" : "Add an extra layer of security"}
              </p>
            </div>
          </div>

          <div className="divider-gradient mb-8" />

          {step === "idle" && (
            <div>
              {isEnabled ? (
                <div className="space-y-6">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <p className="text-sm text-emerald-800">MFA is active on your account. You can disable it below.</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep("verify_disable")} className="rounded-xl bg-red-500 px-8 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-all">
                    Disable MFA
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-sm text-navy-600">Multi-factor authentication adds an extra layer of security by requiring a one-time code from your authenticator app in addition to your password.</p>
                  <div className="rounded-xl bg-navy-50 p-4 flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-navy-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-navy-900">How it works</p>
                      <ol className="mt-1 text-sm text-navy-500 space-y-1 list-decimal list-inside">
                        <li>Generate a QR code and scan it with your authenticator app</li>
                        <li>Enter the 6-digit code from the app to verify</li>
                        <li>MFA will be enabled for future logins</li>
                      </ol>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSetup} disabled={loading} className="rounded-xl bg-navy-900 px-8 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60 transition-all">
                    {loading ? "Generating..." : "Set up MFA"}
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {step === "setup" && (
            <div className="space-y-6">
              <p className="text-sm text-navy-600">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>

              <div className="flex justify-center">
                <div className="rounded-2xl border-2 border-navy-200 bg-white p-4">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="MFA QR Code" className="h-48 w-48" />
                  ) : (
                    <div className="h-48 w-48 flex items-center justify-center text-navy-300 text-sm">Generating QR...</div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-navy-50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Or enter this key manually</p>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleCopySecret} className="flex items-center gap-1 text-xs font-medium text-navy-600 hover:text-navy-900 transition-all">
                    {copied ? <><CheckCircle2 className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </motion.button>
                </div>
                <p className="font-mono text-sm font-bold text-navy-900 break-all">{secret}</p>
              </div>

              <div className="divider-gradient" />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-700">
                  <KeyRound className="mr-1.5 inline h-3.5 w-3.5 text-navy-400" />
                  Verification Code
                </label>
                <Input
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleEnable} disabled={loading} className="rounded-xl bg-navy-900 px-8 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60 transition-all">
                  {loading ? "Verifying..." : "Enable MFA"}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={reset} disabled={loading} className="rounded-xl border border-navy-200 px-6 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50 transition-all">
                  Cancel
                </motion.button>
              </div>
            </div>
          )}

          {step === "verify_disable" && (
            <div className="space-y-6">
              <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Disable MFA</p>
                  <p className="text-sm text-yellow-700">Enter a code from your authenticator app to confirm disabling MFA.</p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-navy-700">
                  <KeyRound className="mr-1.5 inline h-3.5 w-3.5 text-navy-400" />
                  Authentication Code
                </label>
                <Input
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDisable} disabled={loading} className="rounded-xl bg-red-500 px-8 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-all">
                  {loading ? "Verifying..." : "Disable MFA"}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={reset} disabled={loading} className="rounded-xl border border-navy-200 px-6 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50 transition-all">
                  Cancel
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
