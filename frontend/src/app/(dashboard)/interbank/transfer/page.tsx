"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Building2, AlertCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input } from "@/components/ui/form-field";

export default function InterbankTransferPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    from_account_id: "",
    amount: "",
    receiver_bank_swift: "",
    receiver_account: "",
    receiver_name: "",
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
        from_account_id: parseInt(form.from_account_id),
        amount: parseFloat(form.amount),
        receiver_bank_swift: form.receiver_bank_swift,
        receiver_account: form.receiver_account,
        receiver_name: form.receiver_name,
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
        <motion.div whileHover={{ y: -2 }} className="card-premium p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100">
              <Building2 className="h-5 w-5 text-navy-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Interbank Transfer</h1>
              <p className="text-sm text-navy-500">Send money to another bank via the Raast network.</p>
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

            <FormField label="From Account ID">
              <Input type="number" required value={form.from_account_id}
                onChange={(e) => update("from_account_id", e.target.value)} />
            </FormField>

            <FormField label="Amount (PKR)">
              <Input type="number" step="0.01" required value={form.amount}
                onChange={(e) => update("amount", e.target.value)}
                placeholder="0.00" />
            </FormField>

            <FormField label="Receiver Bank SWIFT">
              <Input type="text" required value={form.receiver_bank_swift}
                onChange={(e) => update("receiver_bank_swift", e.target.value)}
                placeholder="HBLPKKA"
                className="font-mono uppercase" />
            </FormField>

            <FormField label="Receiver Account">
              <Input type="text" required value={form.receiver_account}
                onChange={(e) => update("receiver_account", e.target.value)} />
            </FormField>

            <FormField label="Receiver Name">
              <Input type="text" required value={form.receiver_name}
                onChange={(e) => update("receiver_name", e.target.value)} />
            </FormField>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10">
              {loading ? "Processing..." : "Send Transfer"}
            </motion.button>
          </form>
        </motion.div>
      </FadeIn>
    </div>
  );
}
