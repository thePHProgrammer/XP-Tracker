import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins, Heart, Star } from "lucide-react";
import { auth } from "@/auth";
import { getOrCreateCharacter } from "@/lib/domain/character";
import { listGoals } from "@/lib/domain/goals";
import { getLevelProgress } from "@/lib/domain/xp";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";

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
  const overallPercent = Math.round(
    (overall.xpIntoLevel / overall.xpForNextLevel) * 100
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">
          Welcome, {session.user.name ?? session.user.email}
        </h1>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 font-medium text-neutral-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-indigo-300">
              <Star className="h-4 w-4" />
            </span>
            Character Level {overall.level}
          </span>
          <span className="text-sm text-neutral-400">
            {overall.xpIntoLevel} / {overall.xpForNextLevel} XP
          </span>
        </div>
        <ProgressBar percent={overallPercent} tone="xp" />
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-500">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            Gold
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-300">
            {character.gold}
          </p>
        </Card>
        <Card className="p-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-neutral-500">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              HP
            </p>
            <p className="text-sm text-neutral-400">
              {character.hp} / {character.maxHp}
            </p>
          </div>
          <ProgressBar
            percent={(character.hp / character.maxHp) * 100}
            tone="hp"
          />
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Goals</h2>
          <LinkButton href="/goals/new" size="sm">
            + New goal
          </LinkButton>
        </div>

        {goals.length === 0 ? (
          <Card className="border-dashed p-6 text-center text-sm text-neutral-500">
            No goals yet. Create one to start earning XP.
          </Card>
        ) : (
          <ul className="flex flex-col gap-3">
            {goals.map((goal) => {
              const progress = getLevelProgress(goal.totalXp);
              const percent = Math.round(
                (progress.xpIntoLevel / progress.xpForNextLevel) * 100
              );
              return (
                <li key={goal.id}>
                  <Link
                    href={`/goals/${goal.id}`}
                    className="glass-panel block rounded-xl p-4 transition hover:border-white/20 hover:bg-white/[0.07]"
                  >
                    <div className="mb-2.5 flex items-center justify-between">
                      <span className="flex items-center gap-2 font-medium">
                        {goal.icon ? (
                          <span className="text-lg">{goal.icon}</span>
                        ) : null}
                        {goal.title}
                      </span>
                      <span className="text-sm text-neutral-400">
                        Level {progress.level}
                      </span>
                    </div>
                    <ProgressBar percent={percent} tone="xp" className="h-1.5" />
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
