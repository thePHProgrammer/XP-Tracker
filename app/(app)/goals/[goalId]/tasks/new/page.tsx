import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOwnedGoal } from "@/lib/domain/goals";
import { NewTaskForm } from "./new-task-form";

export default async function NewTaskPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { goalId } = await params;
  const goal = await getOwnedGoal(session.user.id, goalId);
  if (!goal) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">
        New task for <span className="text-neutral-400">{goal.title}</span>
      </h1>
      <NewTaskForm goalId={goal.id} />
    </div>
  );
}
