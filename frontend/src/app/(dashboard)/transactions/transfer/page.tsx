"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, ArrowLeftRight, AlertCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input } from "@/components/ui/form-field";

const transferSchema = z.object({
  from_account_id: z.coerce.number().int().positive("Required"),
  to_account_id: z.coerce.number().int().positive("Required"),
  amount: z.coerce.number().positive("Must be greater than 0"),
  description: z.string().optional(),
});

type TransferFormValues = z.infer<typeof transferSchema>;

export default function TransferPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
  });

  async function onSubmit(data: TransferFormValues) {
    setError("");
    setLoading(true);
    try {
      const { data: res } = await api.post("/transactions/transfer", {
        from_account_id: data.from_account_id,
        to_account_id: data.to_account_id,
        amount: data.amount,
        description: data.description || undefined,
      });
      router.push(`/transactions/receipt/${res.data.transaction_id}`);
    } catch {
      setError("Transfer failed. Check account IDs and balance.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      <FadeIn>
        <motion.div whileHover={{ y: -2 }} className="card-easytrust p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
              <ArrowLeftRight className="h-5 w-5 text-navy-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Transfer Funds</h1>
              <p className="text-sm text-navy-500">Send money between accounts.</p>
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

            <FormField label="From Account ID" error={errors.from_account_id?.message}>
              <Input type="number" {...register("from_account_id")} />
            </FormField>

            <FormField label="To Account ID" error={errors.to_account_id?.message}>
              <Input type="number" {...register("to_account_id")} />
            </FormField>

            <FormField label="Amount (PKR)" error={errors.amount?.message}>
              <Input type="number" step="0.01" {...register("amount")} placeholder="0.00" />
            </FormField>

            <FormField label="Description (optional)" error={errors.description?.message}>
              <Input type="text" {...register("description")} placeholder="What's this for?" />
            </FormField>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full rounded-lg bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10">
              {loading ? "Processing..." : "Transfer"}
            </motion.button>
          </form>
        </motion.div>
      </FadeIn>
    </div>
  );
}
