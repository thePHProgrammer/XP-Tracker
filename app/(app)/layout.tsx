import Link from "next/link";
import { redirect } from "next/navigation";
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
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-neutral-800 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/dashboard" className="font-bold">
            XP Tracker
          </Link>
          <nav className="flex items-center gap-4 text-sm text-neutral-400">
            <Link
              href="/shop"
              className="transition hover:text-neutral-200"
            >
              Shop
            </Link>
            <Link
              href="/history"
              className="transition hover:text-neutral-200"
            >
              History
            </Link>
            <Link
              href="/settings"
              className="transition hover:text-neutral-200"
            >
              Settings
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
              className="text-neutral-400 transition hover:text-neutral-200"
            >
              Log out
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
