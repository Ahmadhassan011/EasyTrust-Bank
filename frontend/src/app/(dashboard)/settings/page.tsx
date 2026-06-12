"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/auth";
import { useCustomer, useUpdateCustomer } from "@/hooks/useApi";
import { formatDate } from "@/lib/utils";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/animations";
import { FormField, Input } from "@/components/ui/form-field";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  User, Mail, Phone, MapPin, Calendar, ShieldCheck, ArrowLeft, CheckCircle2
} from "lucide-react";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const isCustomer = user?.type === "customer";

  if (isCustomer) return <CustomerSettings userId={user!.userId} />;
  return <EmployeeSettings user={user!} />;
}

function CustomerSettings({ userId }: { userId: number }) {
  const { data: profile, isLoading } = useCustomer(userId);
  const updateMutation = useUpdateCustomer();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    await updateMutation.mutateAsync({ id: userId, ...form });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-4 w-32" />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <FadeIn>
        <div className="card-premium p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-700">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Profile Settings</h1>
              <p className="text-sm text-navy-400">Manage your personal information</p>
            </div>
          </div>

          <div className="divider-gradient mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="rounded-xl bg-navy-50/50 p-4">
              <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">KYC Status</p>
              <span className={`mt-1 inline-block rounded-lg border px-3 py-1 text-sm font-medium ${
                profile?.kyc_status === "VERIFIED"
                  ? "text-green-600 bg-green-50 border-green-200"
                  : profile?.kyc_status === "REJECTED"
                  ? "text-red-600 bg-red-50 border-red-200"
                  : "text-yellow-600 bg-yellow-50 border-yellow-200"
              }`}>
                {profile?.kyc_status}
              </span>
            </div>
            <div className="rounded-xl bg-navy-50/50 p-4">
              <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">CNIC</p>
              <p className="mt-1 font-mono text-sm font-semibold text-navy-900">{profile?.cnic}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="First Name" icon={User}>
                <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
              </FormField>
              <FormField label="Last Name" icon={User}>
                <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required />
              </FormField>
            </div>

            <FormField label="Email" icon={Mail}>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Phone" icon={Phone}>
                <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </FormField>
              <FormField label="Date of Birth" icon={Calendar}>
                <Input value={profile?.dob ? formatDate(profile.dob) : "—"} disabled />
              </FormField>
            </div>

            <FormField label="Address" icon={MapPin}>
              <Input value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </FormField>

            <div className="flex items-center gap-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-xl bg-navy-900 px-8 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-60 transition-all"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </motion.button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-sm font-medium text-emerald-600"
                >
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </motion.span>
              )}
            </div>
          </form>
        </div>
      </FadeIn>
    </div>
  );
}

function EmployeeSettings({ user }: { user: NonNullable<ReturnType<typeof useAuthStore.getState>["user"]> }) {
  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-all">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <FadeIn>
        <div className="card-premium p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-700">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">Profile Settings</h1>
              <p className="text-sm text-navy-400">Account & security settings</p>
            </div>
          </div>

          <div className="divider-gradient mb-8" />

          <StaggerGrid>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <StaggerItem>
                <div className="rounded-xl bg-navy-50/50 p-4">
                  <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Name</p>
                  <p className="mt-1 font-semibold text-navy-900">{user.firstName} {user.lastName}</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="rounded-xl bg-navy-50/50 p-4">
                  <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Email</p>
                  <p className="mt-1 font-semibold text-navy-900">{user.email}</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="rounded-xl bg-navy-50/50 p-4">
                  <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Role</p>
                  <p className="mt-1 font-semibold text-navy-900 capitalize">{user.role?.toLowerCase().replace("_", " ")}</p>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="rounded-xl bg-navy-50/50 p-4">
                  <p className="text-xs text-navy-400 font-medium uppercase tracking-wider">Account Type</p>
                  <p className="mt-1 font-semibold text-navy-900 capitalize">{user.type}</p>
                </div>
              </StaggerItem>
            </div>
          </StaggerGrid>

          <div className="divider-gradient mb-6" />

          <div>
            <h2 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-navy-400" /> Security
            </h2>
            <Link href="/settings/mfa">
              <motion.div whileHover={{ y: -1 }} className="card-premium flex items-center justify-between p-4 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-100 text-navy-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900">Multi-Factor Authentication</p>
                    <p className="text-xs text-navy-400">Manage MFA settings</p>
                  </div>
                </div>
                <span className="text-sm text-navy-400">&rarr;</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-navy-100 ${className}`} />;
}
