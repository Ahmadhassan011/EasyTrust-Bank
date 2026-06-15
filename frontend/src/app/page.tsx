"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { easeOut } from "@/components/ui/animations";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import {
  Landmark, ArrowLeftRight, HandCoins, Building2,
  ShieldCheck, Zap, BarChart3, ArrowRight,
  Fingerprint, Lock, Network,
  Wallet, CreditCard,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";

const features = [
  { icon: ShieldCheck, title: "Enterprise Security", desc: "JWT-based authentication with role-based access control, TOTP multi-factor authentication for employees, and bcrypt password hashing." },
  { icon: Zap, title: "Real-Time Processing", desc: "Instant balance updates on every transaction, with ACID-compliant PostgreSQL guarantees and atomic transfers." },
  { icon: BarChart3, title: "Full Audit Trail", desc: "Every employee action is logged. Immutable audit records with entity-level tracking for compliance and transparency." },
];

const services = [
  { icon: Wallet, title: "Checking Accounts", desc: "Everyday banking with instant access to your funds." },
  { icon: HandCoins, title: "Savings Accounts", desc: "Grow your money with competitive interest rates." },
  { icon: Building2, title: "Personal Loans", desc: "Flexible financing for your personal needs." },
  { icon: ArrowLeftRight, title: "Interbank Transfers", desc: "Send money across banks via the Raast network." },
];

const securityItems = [
  { icon: ShieldCheck, title: "Encrypted Transactions", desc: "All data encrypted in transit via TLS. Passwords hashed with bcrypt. JWT tokens signed with server-side keys." },
  { icon: Fingerprint, title: "Multi-Factor Auth", desc: "TOTP-based multi-factor authentication for all employee accounts. Role-based access controls limit exposure." },
  { icon: Network, title: "Secure Network", desc: "Role-based access with granular permissions. Full audit logging for every employee action across the platform." },
];

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, delay, ease: easeOut }}>
      {children}
    </motion.div>
  );
}

function GlowOrb({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />;
}

function CardVisual() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-white/5 rounded-3xl blur-2xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative w-full max-w-md"
        role="img"
        aria-label="Credit card visual representation showing bank card with chip and design elements"
      >
        <div className="relative bg-gradient-to-br from-navy-600 to-navy-800 rounded-2xl p-7 shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-white/10 rounded-full" />

          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Landmark className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-semibold text-white">EasyTrust</span>
            </div>
            <Lock className="h-4 w-4 text-white/60" />
          </div>

          <div className="space-y-1 mb-10 relative z-10">
            <div className="flex gap-4">
              {[4, 2, 6, 8].map((n, i) => (
                <span key={i} className="text-xl tracking-[0.2em] text-white/80 font-mono">****</span>
              ))}
            </div>
            <div className="flex items-center justify-between mt-5">
              <div>
                <p className="text-xs text-white/50">Card Holder</p>
                <p className="text-sm font-medium text-white">EasyTrust Bank</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/50">Expires</p>
                <p className="text-sm font-mono text-white">12/28</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-center">
            <div className="flex gap-5">
              {[1, 2, 3].map((dot) => (
                <motion.div
                  key={dot}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: dot * 0.3 }}
                  className="h-2 w-2 rounded-full bg-white/40"
                />
              ))}
            </div>
            <CreditCard className="h-5 w-5 text-white/40" />
          </div>
        </div>

        <motion.div
          animate={{ rotate: [0, 5, 0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute -bottom-4 -right-4 w-28 h-18 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg flex items-center justify-center -z-10"
        >
          <ShieldCheck className="h-6 w-6 text-white/30" />
        </motion.div>
        <motion.div
          animate={{ rotate: [0, -4, 0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute -top-3 -left-3 w-24 h-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg flex items-center justify-center -z-10"
        >
          <Network className="h-5 w-5 text-white/30" />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <PublicNavbar />

        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-navy-900">
          <GlowOrb className="top-1/4 -left-20 w-80 h-80 bg-navy-900/10" />
          <GlowOrb className="bottom-1/4 right-0 w-96 h-96 bg-navy-900/10" />

          <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32 md:py-40 relative z-10 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>


                <h1 className="text-4xl sm:text-5xl md:text-7xl leading-[1.1] md:leading-[1.05] text-white font-balance" style={{ fontFamily: "var(--font-display)", fontWeight: 470 }}>
                  <span className="text-navy-300">Simple.</span>{" "}
                  <span className="text-navy-100">Secure.</span>{" "}
                  <span className="text-white">Seamless.</span>
                </h1>

                <p className="mt-6 max-w-lg text-base sm:text-lg text-navy-200 leading-relaxed">
                  EasyTrust Bank combines modern security practices with straightforward banking.
                  Real-time transfers, unified accounts, and branch-connected service.
                </p>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link href="/register"
                    className="rounded-lg bg-white px-7 py-3 text-sm font-semibold text-navy-900 hover:bg-navy-50 transition-all shadow-xl shadow-navy-900/20 inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                    <Landmark className="h-4 w-4" />
                    Open an Account
                  </Link>
                  <Link href="/login"
                    className="rounded-lg border border-navy-400 px-7 py-3 text-sm font-semibold text-white hover:bg-navy-800 transition-all inline-flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="hidden lg:flex justify-center -ml-8">
              <CardVisual />
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      <section className="bg-background py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <GlowOrb className="bottom-0 -left-20 w-80 h-80 bg-primary/5" />
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <FadeUp>
            <div className="mb-12 sm:mb-16">
              <span className="serial-number text-muted-foreground">02</span>
              <h2 className="mt-3 text-3xl sm:text-4xl text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}>
                Built different
              </h2>
              <p className="mt-3 text-muted-foreground max-w-lg">Engineered for the way banking actually works. Enterprise-grade security, speed, and reliability.</p>
            </div>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, i) => (
              <FadeUp key={feature.title} delay={0.1 * i} className="h-full">
                <motion.div
                  whileHover={{ y: -3 }}
                  className="group bg-card border border-border rounded-xl p-7 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all group-hover:bg-primary/90 shrink-0">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{feature.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <GlowOrb className="top-1/3 right-0 w-64 h-64 bg-primary/5" />
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <FadeUp>
            <div className="mb-12 sm:mb-16">
              <span className="serial-number text-muted-foreground">03</span>
              <h2 className="mt-3 text-3xl sm:text-4xl text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}>
                Security & trust
              </h2>
              <p className="mt-3 text-muted-foreground max-w-lg">Bank-grade security built into every layer. Your data, encrypted and protected.</p>
            </div>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-3">
            {securityItems.map((item, i) => (
              <FadeUp key={item.title} delay={0.1 * i} className="h-full">
                <motion.div
                  whileHover={{ y: -3 }}
                  className="bg-background border border-border rounded-xl p-7 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{item.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-24 md:py-32 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <FadeUp>
            <div className="mb-12 sm:mb-16">
              <span className="serial-number text-muted-foreground">04</span>
              <h2 className="mt-3 text-3xl sm:text-4xl text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}>
                Our services
              </h2>
              <p className="mt-3 text-muted-foreground max-w-lg">Comprehensive banking solutions tailored to your needs.</p>
            </div>
          </FadeUp>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <FadeUp key={service.title} delay={0.08 * i} className="h-full">
                <motion.div
                  whileHover={{ y: -3 }}
                  className="group bg-card border border-border rounded-xl p-6 transition-all hover:border-primary/20 hover:shadow-md h-full flex flex-col"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-muted-foreground transition-all group-hover:bg-primary group-hover:text-primary-foreground shrink-0">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-semibold text-foreground">{service.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground flex-1">{service.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-20 md:py-28 bg-muted">
        <GlowOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5" />
        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}>
              One network. Every branch.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Open your EasyTrust account today and join a bank that works as one.
            </p>
            <Link href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
              <Landmark className="h-4 w-4" />
              Open an Account
            </Link>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </>
  );
}
