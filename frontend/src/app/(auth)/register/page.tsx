"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { easeOut } from "@/components/ui/animations";
import { Landmark, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/form-field";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    cnic: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await register(
        form.first_name,
        form.last_name,
        form.email,
        form.cnic,
        form.password,
      );
      router.push("/login?registered=true");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}       transition={{ duration: 0.5, ease: easeOut }}
      className="w-full max-w-md">
      <div className="card-premium p-8">
        <div className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 shadow-lg shadow-navy-900/10">
            <Landmark className="h-5 w-5 text-white" />
          </motion.div>
          <h1 className="mt-5 text-2xl font-bold text-navy-900">Create account</h1>
          <p className="mt-1.5 text-sm text-navy-500">
            Open your EasyTrust banking account.
          </p>
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">First Name</label>
              <Input type="text" required value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                placeholder="John" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-700">Last Name</label>
              <Input type="text" required value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-700">Email</label>
            <Input type="email" required value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@example.com" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-700">CNIC</label>
            <Input type="text" required value={form.cnic}
              onChange={(e) => update("cnic", e.target.value)}
              placeholder="12345-6789012-3"
              className="font-mono" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-700">Password</label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} required value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min. 8 characters" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 transition-colors">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-navy-700">Confirm Password</label>
            <Input type="password" required value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
              placeholder="Repeat your password" />
          </div>

          <motion.button type="submit" disabled={loading}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="w-full rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-all shadow-lg shadow-navy-900/10">
            {loading ? "Creating account..." : "Create account"}
          </motion.button>

          <p className="text-center text-sm text-navy-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-navy-900 hover:text-navy-700 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </motion.div>
  );
}
