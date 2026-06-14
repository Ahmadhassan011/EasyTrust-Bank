"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/animations";
import { CardSkeleton } from "@/components/ui/skeleton";

export default function TicketsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-900">My Support Tickets</h1>
      <FadeIn>
        <div className="card-easytrust p-8 text-center text-navy-500">
          <p>You have no active support tickets.</p>
        </div>
      </FadeIn>
    </div>
  );
}