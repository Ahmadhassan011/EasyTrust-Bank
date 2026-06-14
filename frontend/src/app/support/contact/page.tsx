"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { easeOut } from "@/components/ui/animations";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { FormField, Input, Select, Textarea } from "@/components/ui/form-field";
import { Phone, Mail, Clock, Building2, ArrowLeft, CheckCircle2 } from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    label: "24/7 Helpline",
    value: "0800-12345",
    detail: "Available any time, any day",
  },
  {
    icon: Mail,
    label: "Email Support",
    value: "support@easytrustbank.com",
    detail: "Response within one business day",
  },
  {
    icon: Clock,
    label: "Branch Hours",
    value: "Mon – Fri, 9:00 AM – 5:00 PM",
    detail: "Saturday 9:00 AM – 1:00 PM",
  },
  {
    icon: Building2,
    label: "Head Office",
    value: "12 branches nationwide",
    detail: "Visit any branch for in-person help",
  },
];

export default function ContactSupportPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            <span className="serial-number text-navy-400">Contact</span>
            <h1
              className="mt-3 text-4xl sm:text-5xl text-white"
              style={{ fontFamily: "var(--font-display)", fontWeight: 480 }}
            >
              Contact support
            </h1>
            <p className="mt-4 text-lg text-navy-300 leading-relaxed max-w-xl">
              Our team is here to help. Fill out the form and we will get back to you within one business day, or reach us directly using the details below.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* Main content */}
      <section className="bg-background py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">

            {/* Left — contact details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="lg:col-span-2 space-y-6"
            >
              <div>
                <span className="serial-number text-muted-foreground">01</span>
                <h2
                  className="mt-2 text-2xl font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}
                >
                  Ways to reach us
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  For urgent issues such as a lost card or suspected fraud, please call our helpline directly.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info, i) => (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 0.2, duration: 0.4, ease: easeOut }}
                    className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white">
                      <info.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {info.label}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{info.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{info.detail}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card px-5 py-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">FAQ:</strong> Many questions are already answered in our{" "}
                  <Link href="/support/faq" className="text-primary underline underline-offset-2 hover:text-primary/80">
                    knowledge base
                  </Link>
                  . Check there first for the fastest response.
                </p>
              </div>
            </motion.div>

            {/* Right — contact form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl border border-border bg-card p-8">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: easeOut }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-foreground">Message sent</h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xs">
                      Thank you for reaching out. We will review your message and reply within one business day.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-7">
                      <span className="serial-number text-muted-foreground">02</span>
                      <h2
                        className="mt-2 text-2xl font-semibold text-foreground"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 460 }}
                      >
                        Send a message
                      </h2>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        All fields marked with * are required.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField label="First name *">
                          <Input placeholder="Ahmad" required />
                        </FormField>
                        <FormField label="Last name *">
                          <Input placeholder="Hassan" required />
                        </FormField>
                      </div>

                      <FormField label="Email address *">
                        <Input type="email" placeholder="you@example.com" required />
                      </FormField>

                      <FormField label="Account number">
                        <Input placeholder="ETB-XXXX-XXXXXXXX (optional)" />
                      </FormField>

                      <FormField label="Category *">
                        <Select required defaultValue="">
                          <option value="" disabled>Select a topic</option>
                          <option value="account">Account &amp; KYC</option>
                          <option value="transaction">Transactions &amp; Transfers</option>
                          <option value="loan">Loans &amp; Repayments</option>
                          <option value="card">Card Issues</option>
                          <option value="security">Security &amp; Fraud</option>
                          <option value="other">Other</option>
                        </Select>
                      </FormField>

                      <FormField label="Subject *">
                        <Input placeholder="Briefly describe your issue" required />
                      </FormField>

                      <FormField label="Message *">
                        <Textarea
                          rows={5}
                          placeholder="Please provide as much detail as possible so we can assist you quickly."
                          required
                        />
                      </FormField>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full rounded-lg bg-navy-900 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-800 transition-all"
                      >
                        Send Message
                      </motion.button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
