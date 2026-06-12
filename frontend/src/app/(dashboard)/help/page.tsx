"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, StaggerGrid, StaggerItem } from "@/components/ui/animations";
import { HelpCircle, Phone, Mail, Clock, ChevronDown, Building2, LifeBuoy, MessageSquare } from "lucide-react";

const faqs = [
  {
    q: "How do I transfer money between my accounts?",
    a: "Go to Transactions → Transfer, select your accounts, enter the amount, and confirm. Internal transfers are processed instantly.",
  },
  {
    q: "What are the daily transaction limits?",
    a: "Daily limits vary by account type and are shown on your account details page. Contact your branch to request a limit increase.",
  },
  {
    q: "How do I apply for a loan?",
    a: "Navigate to Loans → Apply, choose your loan type (Personal, Home, Auto, or Education), fill in the details, and submit. A loan officer will review your application.",
  },
  {
    q: "Can I make interbank transfers?",
    a: "Yes. Use the Interbank Transfer option. You'll need the recipient's account number and bank SWIFT code. Transfers are processed through the Raast network.",
  },
  {
    q: "What should I do if a transaction fails?",
    a: "First check your account balance and daily limits. If everything looks correct, contact support or visit your nearest branch.",
  },
  {
    q: "How do I reset my password?",
    a: "Contact your branch manager or an administrator to reset your password. For security reasons, self-service password reset is not available.",
  },
  {
    q: "What is MFA and do I need it?",
    a: "Multi-Factor Authentication adds an extra layer of security. It's available for all employee accounts and is strongly recommended. Go to Settings → MFA to set it up.",
  },
];

const contactInfo = [
  { icon: Phone, label: "Helpline", value: "0800-12345", detail: "24/7 Support" },
  { icon: Mail, label: "Email", value: "support@easytrustbank.com", detail: "Response within 24 hours" },
  { icon: Clock, label: "Business Hours", value: "Monday - Friday", detail: "9:00 AM - 5:00 PM" },
  { icon: Building2, label: "Branch Network", value: "Find your nearest branch", detail: "Visit any branch for in-person assistance" },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <FadeIn>
        <div className="card-premium p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-100 text-navy-700 mb-4">
            <LifeBuoy className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Help & Support</h1>
          <p className="mt-1 text-sm text-navy-400">Find answers to common questions and how to reach us</p>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="card-premium p-8">
          <h2 className="text-lg font-semibold text-navy-900 mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-navy-400" /> Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-navy-100 overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-all hover:bg-navy-50"
                >
                  <span className="text-sm font-medium text-navy-900 pr-4">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-navy-400 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-navy-100 px-5 py-4">
                        <p className="text-sm text-navy-500">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="card-premium p-8">
          <h2 className="text-lg font-semibold text-navy-900 mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-navy-400" /> Contact Us
          </h2>
          <StaggerGrid>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((item, idx) => (
                <StaggerItem key={idx}>
                  <div className="rounded-xl bg-navy-50/50 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 text-navy-600">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-semibold text-navy-900">{item.label}</p>
                    </div>
                    <p className="text-sm font-medium text-navy-700">{item.value}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{item.detail}</p>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerGrid>
        </div>
      </FadeIn>
    </div>
  );
}
