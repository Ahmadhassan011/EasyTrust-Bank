"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { easeOut } from "@/components/ui/animations";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Landmark, ShieldCheck, Users, Building2, ArrowRight } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

const milestones = [
  { year: "2010", title: "Founded", desc: "EasyTrust Bank was established with a single branch and a vision to simplify banking." },
  { year: "2015", title: "Digital Expansion", desc: "Launched online banking platform, connecting 5 branches across the region." },
  { year: "2020", title: "Full Integration", desc: "All 12 branches unified under a single real-time distributed banking network." },
  { year: "2024", title: "24,800+ Accounts", desc: "Serving thousands of customers with enterprise-grade security and reliability." },
];

const values = [
  { icon: ShieldCheck, title: "Security First", desc: "End-to-end encryption, MFA, and ACID-compliant transactions." },
  { icon: Users, title: "Customer Focused", desc: "Every decision starts with what's best for our customers." },
  { icon: Building2, title: "Connected Banking", desc: "One network, twelve branches, zero boundaries." },
];

export default function AboutPage() {
  return (
    <>
      <PublicNavbar />

          <section className="relative overflow-hidden bg-navy-900 py-28 md:py-36">
            <div className="mx-auto max-w-7xl px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut }} className="max-w-3xl">
                <span className="serial-number text-navy-400">About</span>
                <h1 className="mt-3 text-4xl sm:text-5xl text-white" style={{ fontFamily: "var(--font-display)", fontWeight: 480 }}>
                  One bank, one network.
                </h1>
                <p className="mt-4 text-lg text-navy-300 leading-relaxed max-w-2xl">
                  EasyTrust Bank is a distributed banking platform connecting 12 branches into a single real-time network.
                  We provide enterprise-grade banking services — accounts, transfers, loans — unified across every location.
                </p>
              </motion.div>
            </div>
          </section>

      <section className="bg-card py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: easeOut }}>
            <span className="serial-number text-muted-foreground">Our Values</span>
            <h2 className="mt-3 text-3xl sm:text-4xl text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}>
              What we stand for
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((value, i) => (
              <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i, duration: 0.5, ease: easeOut }}
                className="card-easytrust p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy-900 text-white">
                  <value.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: easeOut }}>
            <span className="serial-number text-muted-foreground">Timeline</span>
            <h2 className="mt-3 text-3xl sm:text-4xl text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}>
              Our journey
            </h2>
          </motion.div>

          <div className="mt-12 space-y-8">
            {milestones.map((m, i) => (
              <motion.div key={m.year} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 * i, duration: 0.5, ease: easeOut }}
                className="flex gap-6 items-start">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">{m.year}</div>
                  {i < milestones.length - 1 && <div className="mt-2 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-semibold text-foreground">{m.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
                </div>
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
