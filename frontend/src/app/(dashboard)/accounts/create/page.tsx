"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Landmark, AlertCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input, Select } from "@/components/ui/form-field";

export default function CreateAccountPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    customer_id: "",
    branch_id: "1",
    account_type: "SAVINGS",
    currency: "PKR",
    daily_limit: "50000",
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
      await api.post("/accounts", {
        customer_id: parseInt(form.customer_id),
        branch_id: parseInt(form.branch_id),
        account_type: form.account_type,
        currency: form.currency,
        daily_limit: parseFloat(form.daily_limit),
      });
      router.push("/accounts");
    } catch {
      setError("Failed to create account. Please check the customer ID and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/accounts" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
          <ArrowLeft className="h-4 w-4" />
          Accounts
        </Link>
      </div>

      <FadeIn>
        <motion.div whileHover={{ y: -2 }} className="card-premium p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100">
              <Landmark className="h-5 w-5 text-navy-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Create Account</h1>
              <p className="text-sm text-navy-500">Open a new account for a customer.</p>
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

            <FormField label="Customer ID">
              <Input type="number" required value={form.customer_id}
                onChange={(e) => update("customer_id", e.target.value)}
                placeholder="e.g. 1" />
            </FormField>

            <FormField label="Branch ID">
              <Input type="number" required value={form.branch_id}
                onChange={(e) => update("branch_id", e.target.value)} />
            </FormField>

            <FormField label="Account Type">
              <Select value={form.account_type} onChange={(e) => update("account_type", e.target.value)}>
                <option value="SAVINGS">Savings</option>
                <option value="CHECKING">Checking</option>
                <option value="FIXED_DEPOSIT">Fixed Deposit</option>
              </Select>
            </FormField>

            <FormField label="Currency">
              <Select value={form.currency} onChange={(e) => update("currency", e.target.value)}>
                <option value="PKR">PKR</option>
                <option value="USD">USD</option>
              </Select>
            </FormField>

            <FormField label="Daily Limit">
              <Input type="number" value={form.daily_limit}
                onChange={(e) => update("daily_limit", e.target.value)} />
            </FormField>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10">
              {loading ? "Creating..." : "Create Account"}
            </motion.button>
          </form>
        </motion.div>
      </FadeIn>
    </div>
  );
}
