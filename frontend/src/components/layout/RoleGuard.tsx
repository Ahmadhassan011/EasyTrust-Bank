"use client";

import { useAuthStore } from "@/store/auth";
import type { Role } from "@/types";

export function RoleGuard({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);

  if (!user || !roles.includes(user.role)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-navy-900">Access Denied</h2>
          <p className="mt-2 text-sm text-navy-500">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
