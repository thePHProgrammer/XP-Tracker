import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-neutral-100"
        >
          <Sparkles className="h-6 w-6 text-indigo-400" />
          XP Tracker
        </Link>
        <Card className="p-6">{children}</Card>
      </div>
    </div>
  );
}
