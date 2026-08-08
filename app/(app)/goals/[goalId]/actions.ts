"use server";

import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { updateGoal, setGoalStatus } from "@/lib/domain/goals";
import { goalSchema } from "@/lib/validation/goals";

export type FormState = { error: string } | undefined;

export async function updateGoalAction(
  goalId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = goalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    icon: formData.get("icon"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const goal = await updateGoal(session.user.id, goalId, parsed.data);
  if (!goal) notFound();

  redirect(`/goals/${goalId}`);
}

export async function archiveGoalAction(goalId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const goal = await setGoalStatus(session.user.id, goalId, "ARCHIVED");
  if (!goal) notFound();

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
