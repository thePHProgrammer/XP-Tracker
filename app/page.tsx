import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-neutral-950 px-6 text-center text-neutral-100">
      <h1 className="text-4xl font-bold">XP Tracker</h1>
      <p className="mt-4 max-w-md text-neutral-400">
        Turn your real-life goals into an RPG. Break goals into habits,
        dailies, and to-dos, earn XP and gold, and level up.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-500"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-700 px-5 py-2 font-medium text-neutral-100 transition hover:bg-neutral-900"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
