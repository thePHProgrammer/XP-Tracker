"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createGoal } from "@/lib/domain/goals";
import { goalSchema } from "@/lib/validation/goals";

export type FormState = { error: string } | undefined;

export async function createGoalAction(
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

  const goal = await createGoal(session.user.id, parsed.data);
  redirect(`/goals/${goal.id}`);
}
