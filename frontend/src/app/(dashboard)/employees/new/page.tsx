"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCreateEmployee } from "@/hooks/useApi";
import Link from "next/link";
import { ArrowLeft, UserCog, AlertCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input } from "@/components/ui/form-field";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { toast } from "sonner";

const ROLES = ["TELLER", "LOAN_OFFICER", "MANAGER", "ADMIN", "AUDITOR"] as const;

export default function NewEmployeePage() {
  const router = useRouter();
  const createEmployee = useCreateEmployee();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "TELLER",
    branch_id: "",
    hire_date: "",
  });
  const [error, setError] = useState("");

  function update(field: string, value: string) {
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
      await createEmployee.mutateAsync({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        role: form.role,
        branch_id: branchId,
        hire_date: form.hire_date || undefined,
      });
      toast.success("Employee created successfully!");
      router.push("/employees");
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? "Failed to create employee.");
    }
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
          <motion.div whileHover={{ y: -2 }} className="card-easytrust p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <UserCog className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">Create Employee</h1>
                <p className="text-sm text-navy-500">Add a new staff member to the system.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

              <FormField label="Password">
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Minimum 8 characters"
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
                  placeholder="e.g. 1"
                />
              </FormField>

              <FormField label="Hire Date (optional)">
                <Input
                  type="date"
                  value={form.hire_date}
                  onChange={(e) => update("hire_date", e.target.value)}
                />
              </FormField>

              <motion.button
                type="submit"
                disabled={createEmployee.isPending}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full rounded-lg bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10"
              >
                {createEmployee.isPending ? "Creating..." : "Create Employee"}
              </motion.button>
            </form>
          </motion.div>
        </FadeIn>
      </div>
    </RoleGuard>
  );
}
