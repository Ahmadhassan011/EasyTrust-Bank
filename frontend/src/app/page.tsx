"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { easeOut } from "@/components/ui/animations";
import { Landmark, ArrowLeftRight, HandCoins, Building2, ShieldCheck, Zap, BarChart3, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Enterprise Security", desc: "End-to-end encryption, JWT authentication with MFA, and row-level locking on all financial transactions." },
  { icon: Zap, title: "Lightning Fast", desc: "Sub-200ms balance queries, sub-500ms transfers, and 50+ transactions per second throughput." },
  { icon: BarChart3, title: "Bank-Grade Reliability", desc: "ACID-compliant transactions, automated failover, and comprehensive audit trails for every operation." },
];

const services = [
  { icon: Landmark, title: "Checking Accounts", desc: "Everyday banking with instant access to your funds." },
  { icon: HandCoins, title: "Savings Accounts", desc: "Grow your money with competitive interest rates." },
  { icon: Building2, title: "Personal Loans", desc: "Flexible financing for your personal needs." },
  { icon: ArrowLeftRight, title: "Interbank Transfers", desc: "Send money across banks via the Raast network." },
];

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, delay, ease: easeOut }}>
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <>
      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-navy-900/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <Landmark className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">EasyTrust</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all">
              Sign In
            </Link>
            <Link href="/register" className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-navy-900 hover:bg-white/90 transition-all shadow-lg shadow-white/10">
              Get Started
            </Link>
          </nav>
        </div>
      </motion.header>

      <section className="gradient-navy relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.04)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center md:py-36 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60 backdrop-blur-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Secure banking platform
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.1]">
            Banking you can
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/70"> trust.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg text-white/60 leading-relaxed">
            Secure, distributed online banking across multiple branches. Manage accounts,
            transfer funds, apply for loans, and more — all in one place.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 flex gap-4">
            <Link href="/register"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-navy-900 hover:bg-white/90 transition-all shadow-2xl shadow-white/10 inline-flex items-center gap-2 hover:scale-105 active:scale-95">
              <Landmark className="h-4 w-4" />
              Open an Account
            </Link>
            <Link href="/login"
              className="rounded-xl border border-white/20 px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all inline-flex items-center gap-2 hover:scale-105 active:scale-95">
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-20 grid grid-cols-3 gap-12 border-t border-white/10 pt-12 text-center w-full max-w-xl">
            {[
              { value: "12+", label: "Branches" },
              { value: "50K+", label: "Customers" },
              { value: "100K+", label: "Transactions" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="mt-1 text-sm text-white/40">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-28">
        <div className="mx-auto max-w-7xl px-6">
          <FadeUp>
            <div className="text-center">
              <span className="inline-block rounded-full bg-navy-100 px-4 py-1.5 text-xs font-semibold text-navy-700 uppercase tracking-wider">Features</span>
              <h2 className="mt-4 text-4xl font-bold text-navy-900">Why EasyTrust?</h2>
              <p className="mt-3 text-navy-500 max-w-lg mx-auto">Built for modern banking with security, speed, and reliability at its core.</p>
            </div>
          </FadeUp>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((feature, i) => (
              <FadeUp key={feature.title} delay={0.1 * i}>
                <motion.div whileHover={{ y: -4 }} className="group card-premium p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-lg shadow-navy-900/10 transition-transform group-hover:scale-110">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-8 text-lg font-semibold text-navy-900">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-500">{feature.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-50 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <FadeUp>
            <div className="text-center">
              <span className="inline-block rounded-full bg-navy-200/50 px-4 py-1.5 text-xs font-semibold text-navy-700 uppercase tracking-wider">Services</span>
              <h2 className="mt-4 text-4xl font-bold text-navy-900">Our Services</h2>
              <p className="mt-3 text-navy-500 max-w-lg mx-auto">Comprehensive banking solutions tailored to your needs.</p>
            </div>
          </FadeUp>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <FadeUp key={service.title} delay={0.1 * i}>
                <motion.div whileHover={{ y: -4, scale: 1.02 }} className="group card-premium p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-100 text-navy-700 transition-all group-hover:bg-navy-900 group-hover:text-white">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 font-semibold text-navy-900">{service.title}</h3>
                  <p className="mt-2 text-sm text-navy-500">{service.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-28">
        <div className="mx-auto max-w-7xl px-6">
          <FadeUp>
            <div className="text-center">
              <span className="inline-block rounded-full bg-navy-100 px-4 py-1.5 text-xs font-semibold text-navy-700 uppercase tracking-wider">Why Choose Us</span>
              <h2 className="mt-4 text-4xl font-bold text-navy-900">Built for reliability</h2>
            </div>
          </FadeUp>
          <div className="mt-16 mx-auto max-w-3xl space-y-6">
            {[
              "Real-time transaction processing with ACID compliance",
              "Multi-branch support with centralized reconciliation",
              "Comprehensive audit trails for regulatory compliance",
              "Role-based access control with granular permissions",
              "Automated loan processing with configurable interest rates",
              "Interbank transfers via Raast instant payment network",
            ].map((item, i) => (
              <FadeUp key={item} delay={0.08 * i}>
                <motion.div whileHover={{ x: 4 }} className="flex items-center gap-4 rounded-xl border border-navy-100 bg-white p-4">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-sm text-navy-700">{item}</span>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="gradient-navy relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_60%)] pointer-events-none" />
        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <FadeUp>
            <h2 className="text-3xl font-bold text-white">Ready to get started?</h2>
            <p className="mt-3 text-white/60">Open your EasyTrust account today and experience modern banking.</p>
            <Link href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-navy-900 hover:bg-white/90 transition-all shadow-2xl shadow-white/10 hover:scale-105 active:scale-95">
              <Landmark className="h-4 w-4" />
              Open an Account
            </Link>
          </FadeUp>
        </div>
      </section>

      <footer className="bg-navy-950 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="divider-gradient mb-8" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                <Landmark className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">EasyTrust</span>
            </div>
            <p className="text-sm text-white/30">
              &copy; {new Date().getFullYear()} EasyTrust Bank. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
