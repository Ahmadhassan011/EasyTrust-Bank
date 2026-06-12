"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, UserPlus, AlertCircle } from "lucide-react";
import { FadeIn } from "@/components/ui/animations";
import { FormField, Input } from "@/components/ui/form-field";

export default function CreateCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", cnic: "", phone: "", address: "", dob: "",
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
      await api.post("/customers", {
        ...form,
        phone: form.phone || undefined,
        address: form.address || undefined,
        dob: form.dob || undefined,
      });
      router.push("/customers");
    } catch {
      setError("Failed to create customer. CNIC or email may already exist.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/customers" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
          <ArrowLeft className="h-4 w-4" /> Customers
        </Link>
      </div>

      <FadeIn>
        <motion.div whileHover={{ y: -2 }} className="card-premium p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100">
              <UserPlus className="h-5 w-5 text-navy-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900">Create Customer</h1>
              <p className="text-sm text-navy-500">Register a new customer.</p>
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

            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name">
                <Input type="text" required value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)} />
              </FormField>
              <FormField label="Last Name">
                <Input type="text" required value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)} />
              </FormField>
            </div>

            <FormField label="Email">
              <Input type="email" required value={form.email}
                onChange={(e) => update("email", e.target.value)} />
            </FormField>

            <FormField label="CNIC">
              <Input type="text" required value={form.cnic}
                onChange={(e) => update("cnic", e.target.value)}
                placeholder="12345-6789012-3"
                className="font-mono" />
            </FormField>

            <FormField label="Phone (optional)">
              <Input type="tel" value={form.phone}
                onChange={(e) => update("phone", e.target.value)} />
            </FormField>

            <FormField label="Address (optional)">
              <Input type="text" value={form.address}
                onChange={(e) => update("address", e.target.value)} />
            </FormField>

            <FormField label="DOB (optional)">
              <Input type="date" value={form.dob}
                onChange={(e) => update("dob", e.target.value)} />
            </FormField>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10">
              {loading ? "Creating..." : "Create Customer"}
            </motion.button>
          </form>
        </motion.div>
      </FadeIn>
    </div>
  );
}
