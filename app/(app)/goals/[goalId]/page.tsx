import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOwnedGoal } from "@/lib/domain/goals";
import { getLevelProgress } from "@/lib/domain/xp";
import { archiveGoalAction } from "./actions";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { goalId } = await params;
  const goal = await getOwnedGoal(session.user.id, goalId);
  if (!goal) notFound();

  const progress = getLevelProgress(goal.totalXp);
  const percent = Math.min(
    100,
    Math.round((progress.xpIntoLevel / progress.xpForNextLevel) * 100)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            {goal.icon ? <span>{goal.icon}</span> : null}
            {goal.title}
          </h1>
          {goal.description ? (
            <p className="mt-1 text-sm text-neutral-400">
              {goal.description}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/goals/${goal.id}/edit`}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 transition hover:bg-neutral-900"
          >
            Edit
          </Link>
          <form action={archiveGoalAction.bind(null, goal.id)}>
            <button
              type="submit"
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 transition hover:bg-neutral-900 hover:text-red-400"
            >
              Archive
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-200">
            Level {progress.level}
          </span>
          <span className="text-neutral-500">
            {progress.xpIntoLevel} / {progress.xpForNextLevel} XP
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-neutral-800 p-6 text-center text-sm text-neutral-500">
        Tasks (habits, dailies, to-dos) will show up here once Tasks CRUD
        (M3) lands.
      </div>
    </div>
  );
}
