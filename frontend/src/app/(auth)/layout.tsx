import Link from "next/link";
import { Landmark } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex items-center border-b border-border bg-background/80 backdrop-blur-md px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Landmark className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>EasyTrust</span>
        </Link>
      </div>
      <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-background via-background to-muted px-4 py-12">
        {children}
      </main>
    </div>
  );
}
