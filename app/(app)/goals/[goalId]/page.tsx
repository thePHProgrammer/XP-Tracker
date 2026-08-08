import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOwnedGoal } from "@/lib/domain/goals";
import { listActiveTasks } from "@/lib/domain/tasks";
import { archiveGoalAction } from "./actions";
import { TaskBoard } from "./task-board";

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

  const tasks = await listActiveTasks(session.user.id, goalId);

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

      <TaskBoard goalId={goal.id} totalXp={goal.totalXp} tasks={tasks} />
    </div>
  );
}
