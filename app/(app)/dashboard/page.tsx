import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrCreateCharacter } from "@/lib/domain/character";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const character = await getOrCreateCharacter(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome, {session.user.name ?? session.user.email}
        </h1>
        <p className="text-sm text-neutral-400">
          This is a live read from the database - it confirms auth and
          Postgres are wired up correctly.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs uppercase text-neutral-500">Total XP</p>
          <p className="text-2xl font-semibold">{character.totalXp}</p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs uppercase text-neutral-500">Gold</p>
          <p className="text-2xl font-semibold">{character.gold}</p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs uppercase text-neutral-500">HP</p>
          <p className="text-2xl font-semibold">
            {character.hp} / {character.maxHp}
          </p>
        </div>
      </div>
      <p className="text-sm text-neutral-500">
        Goals will show up here once Goals CRUD (M2) lands.
      </p>
    </div>
  );
}
