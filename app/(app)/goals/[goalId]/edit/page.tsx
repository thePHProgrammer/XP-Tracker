import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOwnedGoal } from "@/lib/domain/goals";
import { EditGoalForm } from "./edit-form";

export default async function EditGoalPage({
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
      <h1 className="text-xl font-semibold">Edit goal</h1>
      <EditGoalForm
        goalId={goal.id}
        title={goal.title}
        description={goal.description ?? ""}
        icon={goal.icon ?? ""}
      />
    </div>
  );
}
