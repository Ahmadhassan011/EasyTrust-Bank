import Link from "next/link";
import { Landmark } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="flex items-center justify-center border-b border-navy-100 bg-white/80 backdrop-blur-md py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900">
            <Landmark className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-navy-900">EasyTrust</span>
        </Link>
      </div>
      <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-navy-50 to-white px-4 py-12">
        {children}
      </main>
    </div>
  );
}
