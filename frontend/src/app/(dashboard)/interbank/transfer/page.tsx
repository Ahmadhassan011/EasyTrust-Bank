"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useCustomerAccounts } from "@/hooks/useApi";
import Link from "next/link";
import { ArrowLeft, Building2, AlertCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input, Select } from "@/components/ui/form-field";

export default function InterbankTransferPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isCustomer = user?.type === "customer";
  const { data: myAccounts } = useCustomerAccounts(user?.userId ?? 0);

  const [form, setForm] = useState({
    fromAccountId: "",
    amount: "",
    receiverBankSwift: "",
    raastReference: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/interbank/transfer", {
        fromAccountId: parseInt(form.fromAccountId),
        amount: parseFloat(form.amount),
        raastNetworkId: 1,
        senderBankSwift: "EASYPKKHI",
        receiverBankSwift: form.receiverBankSwift.trim().toUpperCase(),
        raastReference: form.raastReference || undefined,
      });
      router.push(`/interbank/${data.data?.transfer_id ?? ""}`);
    } catch {
      setError("Interbank transfer failed. Check details and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </div>

      <FadeIn>
        <motion.div whileHover={{ y: -2 }} className="card-easytrust p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
              <Building2 className="h-5 w-5 text-navy-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Interbank Transfer</h1>
              <p className="text-sm text-navy-500">Send money to another bank via Raast.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <FormField label="From Account">
              {isCustomer && myAccounts?.length ? (
                <Select value={form.fromAccountId} onChange={(e) => update("fromAccountId", e.target.value)} required>
                  <option value="">Select your account</option>
                  {myAccounts.map((a) => (
                    <option key={a.account_id} value={a.account_id}>
                      {a.account_type.toLowerCase().replace("_", " ")} — {a.account_number.slice(0, 12)}… (PKR {Number(a.balance).toLocaleString()})
                    </option>
                  ))}
                </Select>
              ) : (
                <Input type="number" required value={form.fromAccountId}
                  onChange={(e) => update("fromAccountId", e.target.value)}
                  placeholder="Account ID" />
              )}
            </FormField>

            <FormField label="Amount (PKR)">
              <Input type="number" step="0.01" required value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                placeholder="0.00" />
            </FormField>

            <FormField label="Receiver Bank SWIFT Code">
              <Input type="text" required value={form.receiverBankSwift}
                onChange={(e) => update("receiverBankSwift", e.target.value)}
                placeholder="e.g. HBLPKKA0001"
                maxLength={11}
                className="font-mono uppercase" />
            </FormField>

            <FormField label="Raast Reference (optional)">
              <Input type="text" value={form.raastReference}
                onChange={(e) => update("raastReference", e.target.value)}
                placeholder="Raast reference number" />
            </FormField>

            <div className="rounded-lg bg-navy-50 border border-navy-100 px-4 py-3 text-xs text-navy-500">
              Sender bank: <span className="font-mono font-semibold text-navy-700">EASYPKKHI</span> · Raast Network: Main
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full rounded-lg bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10">
              {loading ? "Processing..." : "Send Transfer"}
            </motion.button>
          </form>
        </motion.div>
      </FadeIn>
    </div>
  );
}
