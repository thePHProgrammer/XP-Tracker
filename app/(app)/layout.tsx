import Link from "next/link";
import { redirect } from "next/navigation";
import { History, LogOut, Settings, ShoppingBag, Sparkles } from "lucide-react";
import { auth, signOut } from "@/auth";
import { recomputeDailyRollover } from "@/lib/domain/recompute";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  await recomputeDailyRollover(session.user.id);

  return (
    <div className="flex min-h-screen flex-col text-neutral-100">
      <header className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-white/10 bg-black/40 px-4 py-3.5 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold"
          >
            <Sparkles className="h-5 w-5 text-indigo-400" />
            XP Tracker
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-400">
            <Link
              href="/shop"
              className="flex items-center gap-1.5 transition hover:text-neutral-200"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Shop</span>
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-1.5 transition hover:text-neutral-200"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-1.5 transition hover:text-neutral-200"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm text-neutral-400">
          <span className="hidden truncate sm:inline">
            {session.user.email}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-1.5 text-neutral-400 transition hover:text-neutral-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
