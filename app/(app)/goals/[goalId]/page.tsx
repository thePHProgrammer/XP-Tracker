import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOwnedGoal } from "@/lib/domain/goals";
import { listActiveTasks } from "@/lib/domain/tasks";
import { LinkButton, Button } from "@/components/ui/button";
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            {goal.icon ? <span className="text-2xl">{goal.icon}</span> : null}
            {goal.title}
          </h1>
          {goal.description ? (
            <p className="mt-1 text-sm text-neutral-400">
              {goal.description}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <LinkButton href={`/goals/${goal.id}/edit`} variant="secondary" size="sm">
            Edit
          </LinkButton>
          <form action={archiveGoalAction.bind(null, goal.id)}>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="hover:text-red-400"
            >
              Archive
            </Button>
          </form>
        </div>
      </div>

      <TaskBoard
        goalId={goal.id}
        goalTitle={goal.title}
        totalXp={goal.totalXp}
        tasks={tasks}
      />
    </div>
  );
}
