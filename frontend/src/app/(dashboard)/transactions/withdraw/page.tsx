"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Wallet, AlertCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input } from "@/components/ui/form-field";

export default function WithdrawPage() {
  const router = useRouter();
  const [form, setForm] = useState({ account_id: "", amount: "", description: "" });
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
      const { data: res } = await api.post("/transactions/withdraw", {
        from_account_id: parseInt(form.account_id),
        amount: parseFloat(form.amount),
        description: form.description || undefined,
      });
      router.push(`/transactions/receipt/${res.data.transaction_id}`);
    } catch {
      setError("Withdrawal failed. Check balance and account ID.");
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
        <motion.div whileHover={{ y: -2 }} className="card-premium p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <Wallet className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Withdraw</h1>
              <p className="text-sm text-navy-500">Withdraw cash from an account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <FormField label="Account ID">
              <Input type="number" required value={form.account_id}
                onChange={(e) => update("account_id", e.target.value)} />
            </FormField>

            <FormField label="Amount (PKR)">
              <Input type="number" step="0.01" required value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                placeholder="0.00" />
            </FormField>

            <FormField label="Description (optional)">
              <Input type="text" value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Withdrawal reference" />
            </FormField>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-all shadow-lg shadow-red-600/20">
              {loading ? "Processing..." : "Withdraw"}
            </motion.button>
          </form>
        </motion.div>
      </FadeIn>
    </div>
  );
}
