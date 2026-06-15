"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useCustomerAccounts } from "@/hooks/useApi";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { ArrowLeft, HandCoins, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, Loan } from "@/types";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input, Select, Textarea } from "@/components/ui/form-field";

export default function LoanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const loanId = parseInt(id);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isCustomer = user?.type === "customer";
  const canApprove = user?.role === "LOAN_OFFICER" || user?.role === "MANAGER" || user?.role === "ADMIN";

  const { data: myAccounts } = useCustomerAccounts(user?.userId ?? 0);

  const { data: loan, isLoading, refetch } = useQuery({
    queryKey: ["loan", loanId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Loan>>(`/loans/${loanId}`);
      return data.data;
    },
  });

  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [showRepay, setShowRepay] = useState(false);
  const [repayAccountId, setRepayAccountId] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    setLoading(true);
    setError("");
    try {
      await api.patch(`/loans/${loanId}/approve`, { employeeId: user?.userId });
      refetch();
    } catch {
      setError("Failed to approve loan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    setLoading(true);
    setError("");
    try {
      await api.patch(`/loans/${loanId}/reject`, {
        employeeId: user?.userId,
        reason: rejectReason || undefined,
      });
      refetch();
      setShowReject(false);
    } catch {
      setError("Failed to reject loan.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRepay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post(`/loans/${loanId}/repay`, {
        fromAccountId: parseInt(repayAccountId),
        amount: parseFloat(repayAmount),
      });
      refetch();
      setShowRepay(false);
      setRepayAccountId("");
      setRepayAmount("");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Repayment failed.");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!loan) {
    return (
      <FadeIn>
        <div className="card-easytrust p-16 text-center">
          <HandCoins className="mx-auto h-10 w-10 text-navy-200" />
          <p className="mt-4 text-navy-500">Loan not found.</p>
          <Link href="/loans" className="mt-4 inline-block text-sm font-semibold text-navy-900 hover:text-navy-700">&larr; Back to Loans</Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href="/loans" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
        <ArrowLeft className="h-4 w-4" /> Loans
      </Link>

      <FadeIn>
        <motion.div whileHover={{ y: -2 }} className="card-easytrust p-8">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="mb-6 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
                <HandCoins className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy-900 capitalize">
                  {loan.loan_type?.toLowerCase()} Loan
                </h1>
                <p className="text-sm text-navy-500">{loan.tenure_months} months @ {Number(loan.interest_rate ?? 0)}% APR</p>
              </div>
            </div>
            <span className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${getStatusColor(loan.status ?? "")}`}>
              {loan.status}
            </span>
          </div>

          <div className="divider-brand my-6" />

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-medium text-navy-400">Principal Amount</p>
              <p className="text-3xl font-bold text-navy-900 mt-1">{formatCurrency(Number(loan.principal_amount ?? 0))}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-navy-400">Interest Rate</p>
              <p className="text-3xl font-bold text-navy-900 mt-1">{Number(loan.interest_rate ?? 0)}%</p>
            </div>
          </div>

          {(loan.disbursement_date || loan.maturity_date) && (
            <div className="mt-6 grid grid-cols-2 gap-8">
              {loan.disbursement_date && (
                <div>
                  <p className="text-xs font-medium text-navy-400">Disbursement Date</p>
                  <p className="text-sm font-semibold text-navy-900 mt-0.5">{formatDate(loan.disbursement_date)}</p>
                </div>
              )}
              {loan.maturity_date && (
                <div>
                  <p className="text-xs font-medium text-navy-400">Maturity Date</p>
                  <p className="text-sm font-semibold text-navy-900 mt-0.5">{formatDate(loan.maturity_date)}</p>
                </div>
              )}
            </div>
          )}

          {loan.rejection_reason && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-medium text-red-500">Rejection Reason</p>
              <p className="mt-1 text-sm font-medium text-red-700">{loan.rejection_reason}</p>
            </div>
          )}

          {loan.repayments && loan.repayments.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-navy-900 mb-4">Repayment History</h2>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-navy-50">
                      <th className="px-4 py-3 text-left font-medium text-navy-600">Date</th>
                      <th className="px-4 py-3 text-right font-medium text-navy-600">Amount</th>
                      <th className="px-4 py-3 text-right font-medium text-navy-600">Principal</th>
                      <th className="px-4 py-3 text-right font-medium text-navy-600">Interest</th>
                      <th className="px-4 py-3 text-right font-medium text-navy-600">Remaining</th>
                      <th className="px-4 py-3 text-center font-medium text-navy-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loan.repayments.map((r) => (
                      <tr key={r.repayment_id} className="border-b border-border last:border-0 hover:bg-navy-50 transition-colors">
                        <td className="px-4 py-3 text-navy-600">{formatDate(r.due_date)}</td>
                        <td className="px-4 py-3 text-right font-mono text-navy-900 font-medium">{formatCurrency(Number(r.amount_paid))}</td>
                        <td className="px-4 py-3 text-right font-mono text-navy-700">{formatCurrency(Number(r.principal_component))}</td>
                        <td className="px-4 py-3 text-right font-mono text-navy-700">{formatCurrency(Number(r.interest_component))}</td>
                        <td className="px-4 py-3 text-right font-mono text-navy-700">{formatCurrency(Number(r.remaining_balance))}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`rounded-lg border px-2 py-0.5 text-xs font-medium ${getStatusColor(r.status)}`}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {loan.status === "APPROVED" && isCustomer && (
              <motion.button onClick={() => setShowRepay(!showRepay)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="rounded-lg touch-target bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10">
                {showRepay ? "Cancel" : "Make Repayment"}
              </motion.button>
            )}
            {loan.status === "PENDING" && canApprove && (
              <>
                <motion.button onClick={handleApprove} disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="rounded-lg touch-target bg-green-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 transition-all shadow-lg shadow-green-900/10">
                  {loading ? "Processing..." : "Approve Loan"}
                </motion.button>
                <motion.button onClick={() => setShowReject(!showReject)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="rounded-lg touch-target border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 transition-all">
                  {showReject ? "Cancel" : "Reject"}
                </motion.button>
              </>
            )}
          </div>

          {showRepay && (
            <motion.form onSubmit={handleRepay}
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="mt-6 space-y-4 rounded-lg border border-border bg-navy-50/50 p-5">
              <h3 className="text-sm font-semibold text-navy-900">Repayment Details</h3>
              <FormField label="From Account">
                {myAccounts?.length ? (
                  <Select value={repayAccountId} onChange={(e) => setRepayAccountId(e.target.value)} required>
                    <option value="">Select account</option>
                    {myAccounts.map((a) => (
                      <option key={a.account_id} value={a.account_id}>
                        {a.account_type.toLowerCase().replace("_", " ")} — {a.account_number.slice(0, 12)}… (PKR {Number(a.balance).toLocaleString()})
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input type="number" required value={repayAccountId}
                    onChange={(e) => setRepayAccountId(e.target.value)}
                    placeholder="Account ID" />
                )}
              </FormField>
              <FormField label="Amount (PKR)">
                <Input type="number" step="0.01" required value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  placeholder="0.00" />
              </FormField>
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full rounded-lg touch-target bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all">
                {loading ? "Processing..." : "Confirm Repayment"}
              </motion.button>
            </motion.form>
          )}

          {showReject && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
              <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection (optional)..." rows={3} />
              <motion.button onClick={handleReject} disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="rounded-lg touch-target bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-all shadow-lg shadow-red-900/10">
                {loading ? "Processing..." : "Confirm Rejection"}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </FadeIn>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-navy-100 ${className}`} />;
}
