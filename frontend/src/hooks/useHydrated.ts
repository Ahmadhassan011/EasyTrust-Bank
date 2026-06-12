"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  return hydrated;
}
