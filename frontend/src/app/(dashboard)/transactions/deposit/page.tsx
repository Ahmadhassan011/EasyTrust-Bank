"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useCustomerAccounts } from "@/hooks/useApi";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input, Select } from "@/components/ui/form-field";

const depositSchema = z.object({
  toAccountId: z.number({ invalid_type_error: "Required" }).int().positive("Account required"),
  amount: z.number({ invalid_type_error: "Required" }).positive("Amount must be positive"),
  description: z.string().optional(),
});

type DepositFormValues = z.infer<typeof depositSchema>;

export default function DepositPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isCustomer = user?.type === "customer";
  const { data: myAccounts } = useCustomerAccounts(user?.userId ?? 0);

  const { register, handleSubmit, formState: { errors } } = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
  });

  async function onSubmit(data: DepositFormValues) {
    setLoading(true);
    try {
      const { data: res } = await api.post("/transactions/deposit", data);
      toast.success("Deposit successful");
      router.push(`/transactions/receipt/${res.data.transaction_id}`);
    } catch {
      toast.error("Deposit failed. Please try again.");
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Deposit</h1>
              <p className="text-sm text-navy-500">Add funds to an account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <FormField label="Account" error={errors.toAccountId?.message}>
              {isCustomer && myAccounts?.length ? (
                <Select {...register("toAccountId", { valueAsNumber: true })}>
                  <option value="">Select your account</option>
                  {myAccounts.map((a) => (
                    <option key={a.account_id} value={a.account_id}>
                      {a.account_type.toLowerCase().replace("_", " ")} — {a.account_number.slice(0, 12)}… (PKR {Number(a.balance).toLocaleString()})
                    </option>
                  ))}
                </Select>
              ) : (
                <Input type="number" placeholder="Account ID" {...register("toAccountId", { valueAsNumber: true })} />
              )}
            </FormField>

            <FormField label="Amount (PKR)" error={errors.amount?.message}>
              <Input type="number" step="0.01" placeholder="0.00" {...register("amount", { valueAsNumber: true })} />
            </FormField>

            <FormField label="Description (optional)" error={errors.description?.message}>
              <Input type="text" placeholder="Deposit reference" {...register("description")} />
            </FormField>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20">
              {loading ? "Processing..." : "Deposit"}
            </motion.button>
          </form>
        </motion.div>
      </FadeIn>
    </div>
  );
}
