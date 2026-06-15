"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEmployee, useUpdateEmployee } from "@/hooks/useApi";
import Link from "next/link";
import { ArrowLeft, UserCog, AlertCircle, ShieldCheck, ShieldOff } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input } from "@/components/ui/form-field";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const ROLES = ["TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"] as const;

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  MANAGER: "bg-blue-100 text-blue-700 border-blue-200",
  TELLER: "bg-emerald-100 text-emerald-700 border-emerald-200",
  LOAN_OFFICER: "bg-amber-100 text-amber-700 border-amber-200",
  AUDITOR: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: employee, isLoading } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    branch_id: "",
    is_active: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setForm({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        role: employee.role,
        branch_id: String(employee.branch_id),
        is_active: employee.is_active,
      });
    }
  }, [employee]);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const branchId = parseInt(form.branch_id);
    if (isNaN(branchId) || branchId < 1) {
      setError("Branch ID must be a positive number.");
      return;
    }
    try {
      await updateEmployee.mutateAsync({
        id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role: form.role,
        branch_id: branchId,
        is_active: form.is_active,
      });
      toast.success("Employee updated successfully!");
      router.push("/employees");
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? "Failed to update employee.");
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="h-4 w-24 animate-pulse rounded-lg bg-navy-100" />
        <div className="card-easytrust p-8">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-navy-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20 text-navy-400">
        <UserCog className="mx-auto h-8 w-8 mb-3" />
        <p className="font-medium">Employee not found</p>
        <Link href="/employees" className="mt-2 text-sm underline hover:text-navy-900">
          Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <RoleGuard roles={["ADMIN"]}>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <Link
            href="/employees"
            className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Employees
          </Link>
        </div>

        <FadeIn>
          {/* Info panel */}
          <div className="mb-4 flex items-center gap-4 rounded-xl border border-border bg-background p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-700">
              {employee.first_name[0]}{employee.last_name[0]}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-navy-900">{employee.first_name} {employee.last_name}</p>
              <p className="text-sm text-navy-500">{employee.email}</p>
              <p className="mt-1 text-xs text-navy-400">Hired: {formatDate(employee.hire_date)} · ID #{employee.employee_id}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-block rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[employee.role]}`}>
                {employee.role.replace("_", " ")}
              </span>
              {employee.is_active ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <ShieldCheck className="h-3 w-3" /> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                  <ShieldOff className="h-3 w-3" /> Inactive
                </span>
              )}
            </div>
          </div>

          <motion.div whileHover={{ y: -1 }} className="card-easytrust p-8">
            <h2 className="mb-6 text-lg font-bold text-navy-900">Edit Employee</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FormField label="First Name">
                  <Input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => update("first_name", e.target.value)}
                  />
                </FormField>
                <FormField label="Last Name">
                  <Input
                    type="text"
                    required
                    value={form.last_name}
                    onChange={(e) => update("last_name", e.target.value)}
                  />
                </FormField>
              </div>

              <FormField label="Email">
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </FormField>

              <FormField label="Role">
                <select
                  required
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  className="input-easytrust w-full"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Branch ID">
                <Input
                  type="number"
                  required
                  min={1}
                  value={form.branch_id}
                  onChange={(e) => update("branch_id", e.target.value)}
                />
              </FormField>

              <FormField label="Status">
                <select
                  value={form.is_active ? "true" : "false"}
                  onChange={(e) => update("is_active", e.target.value === "true")}
                  className="input-easytrust w-full"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </FormField>

              <motion.button
                type="submit"
                disabled={updateEmployee.isPending}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full rounded-lg bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10"
              >
                {updateEmployee.isPending ? "Saving..." : "Save Changes"}
              </motion.button>
            </form>
          </motion.div>
        </FadeIn>
      </div>
    </RoleGuard>
  );
}
