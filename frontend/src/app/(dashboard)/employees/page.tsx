"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useEmployees, useDeleteEmployee } from "@/hooks/useApi";
import Link from "next/link";
import { UserCog, Plus, ArrowUpRight, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { FadeIn } from "@/components/ui/animations";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { toast } from "sonner";
import type { Employee } from "@/types";

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
  TELLER: "bg-emerald-100 text-emerald-700 border-emerald-200",
  LOAN_OFFICER: "bg-amber-100 text-amber-700 border-amber-200",
  AUDITOR: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function EmployeesPage() {
  const { data: employees, isLoading } = useEmployees();
  const deleteEmployee = useDeleteEmployee();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to delete ${emp.first_name} ${emp.last_name}? This action cannot be undone.`)) return;
    setDeletingId(emp.employee_id);
    try {
      await deleteEmployee.mutateAsync(emp.employee_id);
      toast.success(`${emp.first_name} ${emp.last_name} has been removed.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.error?.message ?? "Failed to delete employee.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 w-24 animate-pulse rounded-lg bg-navy-100" />
            <div className="mt-2 h-8 w-40 animate-pulse rounded-lg bg-navy-100" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-lg bg-navy-100" />
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border p-4">
              <div className="h-4 w-32 animate-pulse rounded-lg bg-navy-100" />
              <div className="h-4 w-40 animate-pulse rounded-lg bg-navy-100" />
              <div className="h-5 w-20 animate-pulse rounded-lg bg-navy-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <RoleGuard roles={["ADMIN"]}>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-400">Administration</p>
              <h1 className="text-2xl font-bold text-navy-900">Employees</h1>
              <p className="mt-0.5 text-sm text-navy-400">{employees?.length ?? 0} staff members</p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/employees/new"
                className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-3 text-sm font-semibold text-white hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10"
              >
                <Plus className="h-4 w-4" />
                New Employee
              </Link>
            </motion.div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="table-responsive rounded-xl border border-border bg-background shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Name</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Email</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Role</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Branch</th>
                  <th className="px-5 py-3.5 text-center font-semibold text-navy-600">Status</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-navy-600">Hired</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {employees?.map((emp, idx) => (
                  <motion.tr
                    key={emp.employee_id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.3 }}
                    className="border-b border-border last:border-0 hover:bg-navy-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/employees/${emp.employee_id}`}
                        className="font-semibold text-navy-900 hover:text-navy-700 transition-colors"
                      >
                        {emp.first_name} {emp.last_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-navy-600">{emp.email}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[emp.role] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                      >
                        {emp.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-navy-600">
                      {emp.branch?.branch_name ?? `Branch #${emp.branch_id}`}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {emp.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <ShieldCheck className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
                          <ShieldOff className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-navy-500">{formatDate(emp.hire_date)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/employees/${emp.employee_id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-navy-400 hover:text-navy-900 transition-colors"
                        >
                          Edit <ArrowUpRight className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => handleDelete(emp)}
                          disabled={deletingId === emp.employee_id}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {(!employees || employees.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-navy-400">
                      <UserCog className="mx-auto h-8 w-8" />
                      <p className="mt-3 font-medium">No employees found</p>
                      <Link
                        href="/employees/new"
                        className="mt-2 inline-block text-sm text-navy-600 underline hover:text-navy-900"
                      >
                        Create the first one
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </RoleGuard>
  );
}
