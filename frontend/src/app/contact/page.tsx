"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { easeOut } from "@/components/ui/animations";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Landmark, Phone, Mail, Clock, Building2, MapPin, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

const contactMethods = [
  { icon: Phone, label: "Helpline", value: "0800-12345", detail: "24/7 Support" },
  { icon: Mail, label: "Email", value: "support@easytrustbank.com", detail: "Response within 24 hours" },
  { icon: Clock, label: "Business Hours", value: "Monday - Friday", detail: "9:00 AM - 5:00 PM" },
  { icon: Building2, label: "Head Office", value: "12 branches nationwide", detail: "Visit any branch for in-person assistance" },
];

const branches = [
  { city: "Lahore", address: "1-Mall Road, Lahore", phone: "042-111-12345" },
  { city: "Karachi", address: "5-Clifton Road, Karachi", phone: "021-111-12345" },
  { city: "Islamabad", address: "10-Constitution Ave, Islamabad", phone: "051-111-12345" },
];

export default function ContactPage() {
  return (
    <>
      <PublicNavbar />

          <section className="relative overflow-hidden bg-navy-900 py-28 md:py-36">
            <div className="mx-auto max-w-7xl px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut }} className="max-w-3xl">
                <span className="serial-number text-navy-400">Contact</span>
                <h1 className="mt-3 text-4xl sm:text-5xl text-white" style={{ fontFamily: "var(--font-display)", fontWeight: 480 }}>
                  Get in touch
                </h1>
                <p className="mt-4 text-lg text-navy-300 leading-relaxed max-w-2xl">
                  We are here to help. Reach out to our support team or visit any branch.
                </p>
              </motion.div>
            </div>
          </section>

      <section className="bg-card py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method, i) => (
              <motion.div key={method.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i, duration: 0.5, ease: easeOut }}
                className="card-easytrust p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900 text-white">
                  <method.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{method.label}</h3>
                <p className="mt-1 text-sm font-medium text-foreground">{method.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{method.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: easeOut }}>
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span className="serial-number">Our Branches</span>
            </div>
            <h2 className="text-3xl sm:text-4xl text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}>
              Find a branch
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {branches.map((branch, i) => (
              <motion.div key={branch.city} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i, duration: 0.5, ease: easeOut }}
                className="card-easytrust p-6">
                <h3 className="text-lg font-semibold text-foreground">{branch.city}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{branch.address}</p>
                <p className="mt-1 text-sm text-muted-foreground">{branch.phone}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card relative overflow-hidden py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: easeOut }}>
            <h2 className="text-3xl sm:text-4xl text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}>
              Ready to get started?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Open your EasyTrust account today and experience connected banking.
            </p>
            <Link href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-7 py-3 text-sm font-semibold text-white hover:bg-navy-800 transition-all shadow-xl shadow-navy-900/20 hover:scale-[1.02] active:scale-[0.98]">
              <Landmark className="h-4 w-4" />
              Open an Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
