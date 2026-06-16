"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useCustomerAccounts } from "@/hooks/useApi";
import Link from "next/link";
import { ArrowLeft, Wallet, AlertCircle, Shield } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input, Select } from "@/components/ui/form-field";

const withdrawSchema = z.object({
  fromAccountId: z.number({ invalid_type_error: "Required" }).int().positive("Required"),
  amount: z.number({ invalid_type_error: "Required" }).positive("Must be greater than 0"),
  description: z.string().optional(),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export default function WithdrawPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isCustomer = user?.type === "customer";
  const { data: myAccounts } = useCustomerAccounts(user?.userId ?? 0);

  // Role guard — only customers can withdraw
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
                Withdrawals can only be initiated by customers. As a <span className="font-semibold text-navy-700">{user.role}</span>, you do not have permission to perform withdrawals.
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

  const { register, handleSubmit, formState: { errors } } = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
  });

  async function onSubmit(data: WithdrawFormValues) {
    setError("");
    setLoading(true);
    try {
      const { data: res } = await api.post("/transactions/withdraw", data);
      router.push(`/transactions/receipt/${res.data.transaction_id}`);
    } catch {
      setError("Withdrawal failed. Check your balance.");
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <Wallet className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Withdraw</h1>
              <p className="text-sm text-navy-500">Withdraw cash from an account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <FormField label="Account" error={errors.fromAccountId?.message}>
              {isCustomer && myAccounts?.length ? (
                <Select {...register("fromAccountId", { valueAsNumber: true })}>
                  <option value="">Select your account</option>
                  {myAccounts.map((a) => (
                    <option key={a.account_id} value={a.account_id}>
                      {a.account_type.toLowerCase().replace("_", " ")} — {a.account_number.slice(0, 12)}… (PKR {Number(a.balance).toLocaleString()})
                    </option>
                  ))}
                </Select>
              ) : (
                <Input type="number" placeholder="Account ID" {...register("fromAccountId", { valueAsNumber: true })} />
              )}
            </FormField>

            <FormField label="Amount (PKR)" error={errors.amount?.message}>
              <Input type="number" step="0.01" placeholder="0.00" {...register("amount", { valueAsNumber: true })} />
            </FormField>

            <FormField label="Description (optional)" error={errors.description?.message}>
              <Input type="text" placeholder="Withdrawal reference" {...register("description")} />
            </FormField>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-all shadow-lg shadow-red-600/20">
              {loading ? "Processing..." : "Withdraw"}
            </motion.button>
          </form>
        </motion.div>
      </FadeIn>
    </div>
  );
}
