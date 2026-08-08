import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrCreateCharacter } from "@/lib/domain/character";
import { listGoals } from "@/lib/domain/goals";
import { getLevelProgress } from "@/lib/domain/xp";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [character, goals] = await Promise.all([
    getOrCreateCharacter(session.user.id),
    listGoals(session.user.id),
  ]);

  const overall = getLevelProgress(character.totalXp);
  const overallPercent = Math.min(
    100,
    Math.round((overall.xpIntoLevel / overall.xpForNextLevel) * 100)
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome, {session.user.name ?? session.user.email}
        </h1>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-200">
            Character Level {overall.level}
          </span>
          <span className="text-neutral-500">
            {overall.xpIntoLevel} / {overall.xpForNextLevel} XP
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs uppercase text-neutral-500">Gold</p>
          <p className="text-2xl font-semibold">{character.gold}</p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-1 flex items-baseline justify-between">
            <p className="text-xs uppercase text-neutral-500">HP</p>
            <p className="text-sm text-neutral-400">
              {character.hp} / {character.maxHp}
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-red-500 transition-all"
              style={{
                width: `${Math.round(
                  (character.hp / character.maxHp) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Goals</h2>
          <Link
            href="/goals/new"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            + New goal
          </Link>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-800 p-6 text-center text-sm text-neutral-500">
            No goals yet. Create one to start earning XP.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {goals.map((goal) => {
              const progress = getLevelProgress(goal.totalXp);
              const percent = Math.min(
                100,
                Math.round(
                  (progress.xpIntoLevel / progress.xpForNextLevel) * 100
                )
              );
              return (
                <li key={goal.id}>
                  <Link
                    href={`/goals/${goal.id}`}
                    className="block rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition hover:border-neutral-700"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium">
                        {goal.icon ? <span>{goal.icon}</span> : null}
                        {goal.title}
                      </span>
                      <span className="text-sm text-neutral-500">
                        Level {progress.level}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
