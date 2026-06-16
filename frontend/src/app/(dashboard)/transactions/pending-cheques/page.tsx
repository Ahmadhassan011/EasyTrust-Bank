"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import { useChequeRequests, useApproveCheque, useRejectCheque } from "@/hooks/useApi";
import { FadeIn } from "@/components/ui/animations";
import {
  CheckCircle,
  XCircle,
  FileImage,
  User,
  CreditCard,
  Building2,
  Clock,
  ShieldAlert,
  Loader2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

export default function PendingChequesPage() {
  const user = useAuthStore((s) => s.user);
  const isEmployee = user && ["TELLER", "MANAGER", "ADMIN"].includes(user.role);

  const { data: requests, isLoading } = useChequeRequests("PENDING");
  const approveMutation = useApproveCheque();
  const rejectMutation = useRejectCheque();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  if (!isEmployee) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-bold text-navy-900">Access Denied</h1>
        <p className="text-sm text-navy-500 max-w-sm">
          You do not have permission to view pending cheque deposits.
        </p>
        <Link href="/dashboard" className="text-violet-600 hover:underline text-sm font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleApprove = async (id: number) => {
    if (!window.confirm("Are you sure you want to approve this cheque? Funds will be credited immediately.")) return;
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Cheque approved and funds credited successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to approve cheque.");
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    try {
      await rejectMutation.mutateAsync({ id: selectedId, reason: rejectReason });
      toast.success("Cheque deposit rejected.");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || "Failed to reject cheque.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Pending Cheques</h1>
          <p className="text-sm text-navy-500 mt-1">
            Review and approve cheque deposits submitted by customers.
          </p>
        </div>
      </FadeIn>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="grid gap-4">
          <AnimatePresence>
            {requests.map((req) => (
              <motion.div
                key={req.request_id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card-easytrust p-5 sm:p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
              >
                <div className="space-y-4 flex-1 w-full">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-navy-900">
                        PKR {Number(req.amount).toLocaleString()}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-navy-500">
                        <span className="font-mono bg-navy-50 px-1.5 py-0.5 rounded text-navy-700">
                          #{req.cheque_number}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-navy-700">{req.bank_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-xs font-medium text-navy-400 mb-0.5 flex items-center gap-1">
                        <User className="h-3 w-3" /> Customer
                      </p>
                      <p className="text-sm font-semibold text-navy-900">
                        {req.account.customer.first_name} {req.account.customer.last_name}
                      </p>
                      <p className="text-xs text-navy-500">{req.account.customer.cnic}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-navy-400 mb-0.5 flex items-center gap-1">
                        <CreditCard className="h-3 w-3" /> Account
                      </p>
                      <p className="text-sm font-mono font-medium text-navy-900">
                        {req.account.account_number}
                      </p>
                      <p className="text-xs text-navy-500 capitalize">
                        {req.account.account_type.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs font-medium text-navy-400 mb-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Submitted At
                      </p>
                      <p className="text-sm font-medium text-navy-900">
                        {format(new Date(req.requested_at), "dd MMM yyyy, hh:mm a")}
                      </p>
                      <p className="text-xs text-navy-500">
                        {formatDistanceToNow(new Date(req.requested_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-3 w-full md:w-auto md:min-w-[140px] shrink-0 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={approveMutation.isPending}
                    onClick={() => handleApprove(req.request_id)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-all shadow-sm"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedId(req.request_id);
                      setShowRejectModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-all"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <FadeIn>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy-200 bg-navy-50/50 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-navy-900">All caught up!</h2>
            <p className="text-sm text-navy-500 max-w-sm mt-1">
              There are no pending cheque deposit requests to review at the moment.
            </p>
          </div>
        </FadeIn>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h2 className="text-lg font-bold text-navy-900">Reject Cheque Deposit</h2>
              <p className="text-sm text-navy-500 mt-1 mb-4">
                Please provide a reason for rejecting this cheque deposit request. The customer will see this reason.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Image not clear, Invalid amount..."
                className="w-full rounded-xl border border-border p-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none h-24"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 text-sm font-semibold text-navy-600 hover:text-navy-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                  className="rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
