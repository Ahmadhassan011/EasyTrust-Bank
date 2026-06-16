"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useCustomerAccounts } from "@/hooks/useApi";
import Link from "next/link";
import {
  ArrowLeft,
  FileImage,
  CreditCard,
  Upload,
  Camera,
  CheckCircle2,
  X,
  ChevronRight,
  Shield,
  Clock,
  Zap,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { FadeIn } from "@/components/ui/animations";

type DepositMethod = "cheque" | "card" | null;
type ChequeStep = "upload" | "details" | "review";
type CardStep = "card-info" | "amount" | "confirm";

// ── helpers ──────────────────────────────────────────────────
function formatCardNumber(raw: string) {
  return raw
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2);
}
function maskCard(number: string) {
  const d = number.replace(/\D/g, "");
  return `•••• •••• •••• ${d.slice(-4)}`;
}

// ── Account selector component ────────────────────────────────
function AccountSelect({
  accounts,
  value,
  onChange,
}: {
  accounts: any[];
  value: number | null;
  onChange: (id: number) => void;
}) {
  return (
    <div className="space-y-2">
      {accounts.map((a) => (
        <motion.button
          key={a.account_id}
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onChange(a.account_id)}
          className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
            value === a.account_id
              ? "border-emerald-500 bg-emerald-50"
              : "border-border bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy-900 capitalize">
                {a.account_type.toLowerCase().replace("_", " ")} Account
              </p>
              <p className="font-mono text-xs text-navy-500 mt-0.5">{a.account_number}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-navy-900">
                PKR {Number(a.balance).toLocaleString()}
              </p>
              <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 mt-1">
                {a.status}
              </span>
            </div>
          </div>
          {value === a.account_id && (
            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Selected
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}

// ── Photo upload box ──────────────────────────────────────────
function PhotoUploadBox({
  label,
  sublabel,
  file,
  onFile,
  onClear,
}: {
  label: string;
  sublabel: string;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-navy-700">{label}</p>
      <p className="text-xs text-navy-400">{sublabel}</p>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-emerald-300 shadow-sm">
          <img src={preview} alt={label} className="w-full h-44 object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow-md hover:bg-red-50 transition-colors"
          >
            <X className="h-3.5 w-3.5 text-red-500" />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <p className="text-xs font-medium text-white flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Photo captured
            </p>
          </div>
        </div>
      ) : (
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-navy-200 bg-navy-50/50 p-8 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-100 group-hover:bg-emerald-100 transition-colors">
              <Camera className="h-6 w-6 text-navy-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-navy-700 group-hover:text-emerald-700">
                Tap to capture or upload
              </p>
              <p className="text-xs text-navy-400 mt-0.5">JPG, PNG up to 10 MB</p>
            </div>
          </div>
        </motion.button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function DepositPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: myAccounts } = useCustomerAccounts(user?.userId ?? 0);
  const activeAccounts = (myAccounts ?? []).filter((a) => a.status === "ACTIVE");

  // ── Role guard: only customers can deposit ────────────────
  if (user && user.type !== "customer") {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
        <FadeIn>
          <div className="card-easytrust p-10 flex flex-col items-center text-center space-y-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Access Restricted</h1>
              <p className="mt-2 text-sm text-navy-500 max-w-xs">
                Deposits can only be initiated by customers. As a <span className="font-semibold text-navy-700">{user.role}</span>, you do not have permission to perform deposits.
              </p>
              <p className="mt-3 text-xs text-navy-400">
                To deposit funds on behalf of a customer, use the Teller deposit workflow from the Accounts section.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/dashboard")}
              className="rounded-xl bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-700 transition-all"
            >
              Go to Dashboard
            </motion.button>
          </div>
        </FadeIn>
      </div>
    );
  }

  const [method, setMethod] = useState<DepositMethod>(null);
  const [loading, setLoading] = useState(false);

  // ── Cheque state ──────────────────────────────────────────
  const [chequeStep, setChequeStep] = useState<ChequeStep>("upload");
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  const [chequeAccountId, setChequeAccountId] = useState<number | null>(null);
  const [chequeNumber, setChequeNumber] = useState("");
  const [chequeBankName, setChequeBankName] = useState("");
  const [chequeAmount, setChequeAmount] = useState("");
  const [detailsError, setDetailsError] = useState("");

  // ── Card state ────────────────────────────────────────────
  const [cardStep, setCardStep] = useState<CardStep>("card-info");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [cardAccountId, setCardAccountId] = useState<number | null>(null);
  const [cardAmount, setCardAmount] = useState("");

  // ── Auto-select first account once data loads ─────────────
  // useState runs before the async fetch, so we need useEffect
  useEffect(() => {
    if (activeAccounts.length > 0) {
      if (!chequeAccountId) setChequeAccountId(activeAccounts[0].account_id);
      if (!cardAccountId)   setCardAccountId(activeAccounts[0].account_id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAccounts.length]);


  // ── Submit helpers ────────────────────────────────────────
  async function submitChequeDeposit() {
    if (!chequeAccountId || !chequeAmount) return;
    setLoading(true);
    try {
      const { data: res } = await api.post("/transactions/deposit", {
        toAccountId: chequeAccountId,
        amount: parseFloat(chequeAmount),
        description: `Digital Cheque Deposit — Cheque #${chequeNumber} (${chequeBankName})`,
      });
      toast.success("Cheque deposit submitted for processing!");
      router.push(`/transactions/receipt/${res.data.transaction_id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message ?? "Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitCardDeposit() {
    if (!cardAccountId || !cardAmount) return;
    setLoading(true);
    try {
      const last4 = cardNumber.replace(/\D/g, "").slice(-4);
      const { data: res } = await api.post("/transactions/deposit", {
        toAccountId: cardAccountId,
        amount: parseFloat(cardAmount),
        description: `Debit Card Deposit — Card ending in ${last4} (${cardHolder})`,
      });
      toast.success("Debit card deposit successful!");
      router.push(`/transactions/receipt/${res.data.transaction_id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message ?? "Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Method selection screen ───────────────────────────────
  if (!method) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <FadeIn>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-navy-900">Deposit Funds</h1>
            <p className="text-sm text-navy-500">
              Choose how you'd like to add money to your account.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* Digital Cheque Deposit */}
            <motion.button
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMethod("cheque")}
              className="group relative overflow-hidden rounded-2xl border-2 border-border bg-white p-6 text-left shadow-sm hover:border-violet-400 hover:shadow-md transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 group-hover:bg-violet-200 transition-colors shadow-sm">
                  <FileImage className="h-7 w-7 text-violet-600" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-navy-900">Digital Cheque</h2>
                <p className="mt-1 text-sm text-navy-500">
                  Deposit a paper cheque by capturing photos of the front and back.
                </p>
                <div className="mt-4 space-y-1.5">
                  {[
                    { icon: Camera, text: "Capture cheque photos" },
                    { icon: Shield, text: "Secure cheque verification" },
                    { icon: Clock, text: "Processed within 24 hours" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-navy-500">
                      <Icon className="h-3.5 w-3.5 text-violet-500 flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-violet-600 group-hover:gap-2 transition-all">
                  Get started <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </motion.button>

            {/* Debit Card Deposit */}
            <motion.button
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMethod("card")}
              className="group relative overflow-hidden rounded-2xl border-2 border-border bg-white p-6 text-left shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 group-hover:bg-blue-200 transition-colors shadow-sm">
                  <CreditCard className="h-7 w-7 text-blue-600" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-navy-900">Debit Card</h2>
                <p className="mt-1 text-sm text-navy-500">
                  Instantly add funds by transferring from a local debit card.
                </p>
                <div className="mt-4 space-y-1.5">
                  {[
                    { icon: Zap, text: "Instant transfer" },
                    { icon: Shield, text: "Encrypted card data" },
                    { icon: CheckCircle2, text: "Any Pakistani bank card" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-navy-500">
                      <Icon className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                  Get started <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </motion.button>
          </div>
        </FadeIn>
      </div>
    );
  }

  // ── DIGITAL CHEQUE FLOW ───────────────────────────────────
  if (method === "cheque") {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              chequeStep === "upload"
                ? setMethod(null)
                : chequeStep === "details"
                ? setChequeStep("upload")
                : setChequeStep("details")
            }
            className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            {chequeStep === "upload" ? "Back" : "Previous"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {(["upload", "details", "review"] as ChequeStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`h-2 flex-1 rounded-full transition-colors ${
                  ["upload", "details", "review"].indexOf(chequeStep) >= i
                    ? "bg-violet-500"
                    : "bg-navy-100"
                }`}
              />
            </div>
          ))}
        </div>

        <FadeIn>
          <AnimatePresence mode="wait">
            {/* Step 1: Upload photos */}
            {chequeStep === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-easytrust p-8 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                    <Camera className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-navy-900">Capture Cheque</h1>
                    <p className="text-sm text-navy-500">
                      Take clear photos of both sides of your cheque.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-700 space-y-1">
                      <p className="font-semibold">Tips for a clear cheque photo:</p>
                      <ul className="list-disc ml-3 space-y-0.5">
                        <li>Place cheque on a flat, well-lit surface</li>
                        <li>All 4 corners must be visible</li>
                        <li>Ensure all text is readable</li>
                        <li>Do not fold or crease the cheque</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <PhotoUploadBox
                  label="Front of Cheque"
                  sublabel="Capture the front side showing payee name, date, and amount"
                  file={frontPhoto}
                  onFile={setFrontPhoto}
                  onClear={() => setFrontPhoto(null)}
                />

                <PhotoUploadBox
                  label="Back of Cheque"
                  sublabel="Capture the back with your endorsement signature"
                  file={backPhoto}
                  onFile={setBackPhoto}
                  onClear={() => setBackPhoto(null)}
                />

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={!frontPhoto || !backPhoto}
                  onClick={() => setChequeStep("details")}
                  className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-600/20"
                >
                  Continue to Details
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Cheque details */}
            {chequeStep === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-easytrust p-8 space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                    <FileImage className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-navy-900">Cheque Details</h1>
                    <p className="text-sm text-navy-500">Enter the cheque information below.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      Deposit to Account
                    </label>
                    <AccountSelect
                      accounts={activeAccounts}
                      value={chequeAccountId}
                      onChange={setChequeAccountId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      Cheque Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0012345"
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                      className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-mono placeholder-navy-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      Issuing Bank
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HBL, UBL, MCB, Meezan..."
                      value={chequeBankName}
                      onChange={(e) => setChequeBankName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm placeholder-navy-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      Cheque Amount (PKR)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-navy-400">
                        PKR
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="0.00"
                        value={chequeAmount}
                        onChange={(e) => setChequeAmount(e.target.value)}
                        className="w-full rounded-lg border border-border bg-white pl-12 pr-4 py-2.5 text-sm placeholder-navy-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition"
                      />
                    </div>
                  </div>
                </div>

                {detailsError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{detailsError}</span>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                  onClick={() => {
                    // Collect what's missing and tell the user clearly
                    const missing: string[] = [];
                    if (!chequeAccountId) missing.push("select a deposit account");
                    if (!chequeNumber.trim()) missing.push("enter the cheque number");
                    if (!chequeBankName.trim()) missing.push("enter the issuing bank name");
                    if (!chequeAmount || parseFloat(chequeAmount) <= 0) missing.push("enter a valid amount");
                    if (missing.length > 0) {
                      setDetailsError("Please " + missing.join(", then ") + ".");
                      return;
                    }
                    setDetailsError("");
                    setChequeStep("review");
                  }}
                  className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-600/20"
                >
                  Review Deposit
                </motion.button>
              </motion.div>
            )}


            {/* Step 3: Review & Submit */}
            {chequeStep === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-easytrust p-8 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                    <CheckCircle2 className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-navy-900">Review & Submit</h1>
                    <p className="text-sm text-navy-500">Confirm your cheque deposit details.</p>
                  </div>
                </div>

                {/* Cheque preview thumbnails */}
                <div className="grid grid-cols-2 gap-3">
                  {frontPhoto && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-navy-500">Front</p>
                      <img
                        src={URL.createObjectURL(frontPhoto)}
                        className="w-full h-24 object-cover rounded-lg border border-violet-200"
                        alt="Cheque front"
                      />
                    </div>
                  )}
                  {backPhoto && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-navy-500">Back</p>
                      <img
                        src={URL.createObjectURL(backPhoto)}
                        className="w-full h-24 object-cover rounded-lg border border-violet-200"
                        alt="Cheque back"
                      />
                    </div>
                  )}
                </div>

                {/* Summary table */}
                <div className="rounded-xl bg-navy-50 divide-y divide-border">
                  {[
                    { label: "Cheque #", value: chequeNumber },
                    { label: "Issuing Bank", value: chequeBankName },
                    {
                      label: "Deposit to",
                      value: activeAccounts
                        .find((a) => a.account_id === chequeAccountId)
                        ?.account_number ?? "—",
                    },
                    {
                      label: "Amount",
                      value: `PKR ${parseFloat(chequeAmount || "0").toLocaleString()}`,
                      highlight: true,
                    },
                    { label: "Processing time", value: "Within 24 hours" },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-navy-500">{label}</span>
                      <span
                        className={`text-sm font-semibold ${highlight ? "text-violet-600" : "text-navy-900"}`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 flex gap-2.5 text-xs text-violet-700">
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  Your cheque will be verified and funds credited within 24 hours. Physical cheque must be retained for 30 days.
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                  onClick={submitChequeDeposit}
                  className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" /> Submit Cheque Deposit
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </FadeIn>
      </div>
    );
  }

  // ── DEBIT CARD FLOW ───────────────────────────────────────
  if (method === "card") {
    const rawCardDigits = cardNumber.replace(/\D/g, "");
    const cardNetwork =
      rawCardDigits.startsWith("4")
        ? "Visa"
        : rawCardDigits.startsWith("5")
        ? "Mastercard"
        : rawCardDigits.startsWith("6")
        ? "UnionPay"
        : "Card";

    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              cardStep === "card-info"
                ? setMethod(null)
                : cardStep === "amount"
                ? setCardStep("card-info")
                : setCardStep("amount")
            }
            className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            {cardStep === "card-info" ? "Back" : "Previous"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          {(["card-info", "amount", "confirm"] as CardStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`h-2 flex-1 rounded-full transition-colors ${
                  ["card-info", "amount", "confirm"].indexOf(cardStep) >= i
                    ? "bg-blue-500"
                    : "bg-navy-100"
                }`}
              />
            </div>
          ))}
        </div>

        <FadeIn>
          <AnimatePresence mode="wait">
            {/* Step 1: Card info */}
            {cardStep === "card-info" && (
              <motion.div
                key="card-info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-easytrust p-8 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-navy-900">Debit Card Details</h1>
                    <p className="text-sm text-navy-500">Enter your debit card information.</p>
                  </div>
                </div>

                {/* Visual card preview */}
                <motion.div
                  animate={{ rotateY: rawCardDigits.length > 0 ? 0 : 0 }}
                  className="relative h-44 rounded-2xl bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-6 shadow-xl overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(100,150,255,0.3) 0%, transparent 50%)`,
                    }}
                  />
                  <div className="relative h-full flex flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <div className="h-8 w-12 rounded-md bg-amber-400/80 shadow-sm flex items-center justify-center">
                        <div className="h-5 w-8 rounded-sm bg-amber-300/60 border border-amber-400/40" />
                      </div>
                      <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                        {cardNetwork}
                      </span>
                    </div>
                    <div>
                      <p className="font-mono text-xl font-semibold tracking-[0.2em] text-white/90">
                        {rawCardDigits.length > 0
                          ? formatCardNumber(rawCardDigits)
                          : "•••• •••• •••• ••••"}
                      </p>
                      <div className="flex items-end justify-between mt-3">
                        <div>
                          <p className="text-xs text-white/50 uppercase tracking-wider">
                            Card Holder
                          </p>
                          <p className="text-sm font-semibold text-white/90 mt-0.5 uppercase tracking-wide">
                            {cardHolder || "YOUR NAME"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/50 uppercase tracking-wider">Expires</p>
                          <p className="text-sm font-semibold text-white/90 mt-0.5">
                            {cardExpiry || "MM/YY"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      Card Number
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      value={formatCardNumber(cardNumber)}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-mono tracking-wider placeholder-navy-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="As printed on card"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm uppercase tracking-wide placeholder-navy-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-mono placeholder-navy-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">CVV</label>
                      <div className="relative">
                        <input
                          type={showCvv ? "text" : "password"}
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          className="w-full rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm font-mono placeholder-navy-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700"
                        >
                          {showCvv ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 flex gap-2.5 text-xs text-blue-700">
                  <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  Card details are encrypted and never stored. We use 256-bit SSL encryption.
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={
                    rawCardDigits.length !== 16 ||
                    !cardHolder ||
                    cardExpiry.length < 5 ||
                    cardCvv.length < 3
                  }
                  onClick={() => setCardStep("amount")}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                >
                  Continue
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Amount + target account */}
            {cardStep === "amount" && (
              <motion.div
                key="amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-easytrust p-8 space-y-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-navy-900">Amount & Account</h1>
                    <p className="text-sm text-navy-500">How much would you like to deposit?</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">
                    Deposit Amount (PKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-navy-400">
                      PKR
                    </span>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      placeholder="0.00"
                      value={cardAmount}
                      onChange={(e) => setCardAmount(e.target.value)}
                      className="w-full rounded-lg border border-border bg-white pl-12 pr-4 py-3 text-lg font-bold text-navy-900 placeholder-navy-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                    />
                  </div>
                  {/* Quick amount pills */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[5000, 10000, 25000, 50000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCardAmount(String(amt))}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                          cardAmount === String(amt)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-navy-600 border-border hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        PKR {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">
                    Deposit to Account
                  </label>
                  <AccountSelect
                    accounts={activeAccounts}
                    value={cardAccountId}
                    onChange={setCardAccountId}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={!cardAmount || parseFloat(cardAmount) < 100 || !cardAccountId}
                  onClick={() => setCardStep("confirm")}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                >
                  Review Transfer
                </motion.button>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {cardStep === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-easytrust p-8 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-navy-900">Confirm Transfer</h1>
                    <p className="text-sm text-navy-500">Review before finalising.</p>
                  </div>
                </div>

                {/* Mini card visual */}
                <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-800 to-blue-900 p-4 shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Source</p>
                    <p className="text-sm font-semibold text-white">
                      {maskCard(cardNumber)} — {cardHolder}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-navy-50 divide-y divide-border">
                  {[
                    {
                      label: "To Account",
                      value: activeAccounts.find((a) => a.account_id === cardAccountId)?.account_number ?? "—",
                    },
                    {
                      label: "Card",
                      value: maskCard(cardNumber),
                    },
                    {
                      label: "Amount",
                      value: `PKR ${parseFloat(cardAmount || "0").toLocaleString()}`,
                      highlight: true,
                    },
                    { label: "Processing", value: "Instant" },
                    { label: "Fee", value: "PKR 0.00" },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-navy-500">{label}</span>
                      <span
                        className={`text-sm font-semibold ${highlight ? "text-blue-600 text-base" : "text-navy-900"}`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={loading}
                  onClick={submitCardDeposit}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Confirm Deposit
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </FadeIn>
      </div>
    );
  }

  return null;
}
