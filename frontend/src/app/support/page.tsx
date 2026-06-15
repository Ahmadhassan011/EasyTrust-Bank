"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { easeOut } from "@/components/ui/animations";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import {
  BookOpen, MessageSquare, Phone, Mail, Clock,
  ArrowRight, ChevronRight, Shield, CreditCard,
  HandCoins, ArrowLeftRight,
} from "lucide-react";

function FadeUp({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const supportChannels = [
  {
    href: "/support/faq",
    icon: BookOpen,
    label: "Knowledge Base",
    desc: "Browse answers to the most common questions about accounts, transfers, and loans.",
    cta: "Browse FAQs",
  },
  {
    href: "/support/contact",
    icon: MessageSquare,
    label: "Contact Support",
    desc: "Submit a message to our team. We respond within one business day.",
    cta: "Send a message",
  },
  {
    href: "tel:080012345",
    icon: Phone,
    label: "Call Helpline",
    desc: "Speak directly with a support agent. Available 24 hours a day, 7 days a week.",
    cta: "0800-12345",
  },
];

const popularTopics = [
  { icon: BookOpen,       label: "Opening a new account",         href: "/support/faq" },
  { icon: CreditCard,     label: "Lost or blocked debit card",     href: "/support/faq" },
  { icon: ArrowLeftRight, label: "Interbank transfers via Raast",  href: "/support/faq" },
  { icon: HandCoins,      label: "Applying for a personal loan",   href: "/support/faq" },
  { icon: Shield,         label: "Setting up MFA on your account", href: "/support/faq" },
  { icon: Clock,          label: "Daily transaction limits",       href: "/support/faq" },
];

const contactDetails = [
  { icon: Phone, label: "24/7 Helpline",   value: "0800-12345" },
  { icon: Mail,  label: "Email Support",   value: "support@easytrustbank.com" },
  { icon: Clock, label: "Branch Hours",    value: "Mon – Fri, 9:00 AM – 5:00 PM" },
];

export default function SupportHubPage() {
  return (
    <>
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 py-28 md:py-36">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="max-w-2xl"
          >
            <span className="serial-number text-navy-400">Support</span>
            <h1
              className="mt-3 text-4xl sm:text-5xl text-white"
              style={{ fontFamily: "var(--font-display)", fontWeight: 480 }}
            >
              How can we help?
            </h1>
            <p className="mt-4 text-lg text-navy-300 leading-relaxed max-w-xl">
              Find answers in our knowledge base, or reach out to our team directly.
              We are here whenever you need us.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Support channels */}
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <FadeUp>
            <span className="serial-number text-muted-foreground">01</span>
            <h2
              className="mt-3 text-3xl sm:text-4xl text-foreground"
              style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}
            >
              Get help your way
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg">
              Choose the support channel that works best for you.
            </p>
          </FadeUp>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {supportChannels.map((ch, i) => (
              <FadeUp key={ch.label} delay={0.1 * i}>
                <Link
                  href={ch.href}
                  className="group flex flex-col h-full rounded-2xl border border-border bg-card p-7 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    <ch.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{ch.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">{ch.desc}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary">
                    {ch.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Popular topics */}
      <section className="bg-card py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <FadeUp>
            <span className="serial-number text-muted-foreground">02</span>
            <h2
              className="mt-3 text-3xl sm:text-4xl text-foreground"
              style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}
            >
              Popular topics
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg">
              Quick answers to the questions customers ask most.
            </p>
          </FadeUp>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularTopics.map((topic, i) => (
              <FadeUp key={topic.label} delay={0.07 * i}>
                <Link
                  href={topic.href}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-background px-5 py-4 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                    <topic.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {topic.label}
                  </span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Quick contact */}
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <FadeUp>
            <span className="serial-number text-muted-foreground">03</span>
            <h2
              className="mt-3 text-3xl sm:text-4xl text-foreground"
              style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}
            >
              Reach us directly
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg">
              Our support team is available around the clock.
            </p>
          </FadeUp>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {contactDetails.map((c, i) => (
              <FadeUp key={c.label} delay={0.1 * i}>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-900 text-white">
                    <c.icon className="h-4.5 w-4.5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {c.label}
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground">{c.value}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.3}>
            <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 px-7 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">Still can't find what you're looking for?</p>
                <p className="mt-1 text-sm text-muted-foreground">Send us a message and we'll get back to you within one business day.</p>
              </div>
              <Link
                href="/support/contact"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg touch-target bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Contact Support
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      <Footer />
    </>
  );
}
