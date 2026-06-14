"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, HandCoins, AlertCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input, Select } from "@/components/ui/form-field";

const loanSchema = z.object({
  loan_type: z.enum(["PERSONAL", "HOME", "AUTO", "EDUCATION"]),
  principal_amount: z.coerce.number().positive("Must be greater than 0"),
  interest_rate: z.coerce.number().min(0),
  tenure_months: z.coerce.number().int().positive("Must be greater than 0"),
});

type LoanFormValues = z.infer<typeof loanSchema>;

export default function ApplyLoanPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      loan_type: "PERSONAL",
      interest_rate: 12.5,
      tenure_months: 12,
    },
  });

  async function onSubmit(data: LoanFormValues) {
    setError("");
    setLoading(true);
    try {
      await api.post("/loans/apply", {
        loan_type: data.loan_type,
        principal_amount: data.principal_amount,
        interest_rate: data.interest_rate,
        tenure_months: data.tenure_months,
      });
      router.push("/loans");
    } catch {
      setError("Loan application failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/loans" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
          <ArrowLeft className="h-4 w-4" /> Loans
        </Link>
      </div>

      <FadeIn>
        <motion.div whileHover={{ y: -2 }} className="card-easytrust p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
              <HandCoins className="h-5 w-5 text-navy-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Apply for Loan</h1>
              <p className="text-sm text-navy-500">Submit a new loan application.</p>
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

            <FormField label="Loan Type" error={errors.loan_type?.message}>
              <Select {...register("loan_type")}>
                <option value="PERSONAL">Personal</option>
                <option value="HOME">Home</option>
                <option value="AUTO">Auto</option>
                <option value="EDUCATION">Education</option>
              </Select>
            </FormField>

            <FormField label="Principal Amount (PKR)" error={errors.principal_amount?.message}>
              <Input type="number" step="0.01" {...register("principal_amount")} placeholder="e.g. 500000" />
            </FormField>

            <FormField label="Interest Rate (%)" error={errors.interest_rate?.message}>
              <Input type="number" step="0.01" {...register("interest_rate")} />
            </FormField>

            <FormField label="Tenure (months)" error={errors.tenure_months?.message}>
              <Input type="number" {...register("tenure_months")} placeholder="e.g. 12" />
            </FormField>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full rounded-lg bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10">
              {loading ? "Submitting..." : "Submit Application"}
            </motion.button>
          </form>
        </motion.div>
      </FadeIn>
    </div>
  );
}
