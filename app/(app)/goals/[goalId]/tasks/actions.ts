"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  archiveTask,
  completeDaily,
  completeTodo,
  createTask,
  incrementHabit,
} from "@/lib/domain/tasks";
import { createTaskSchema } from "@/lib/validation/tasks";

export type FormState = { error: string } | undefined;

export async function createTaskAction(
  goalId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = createTaskSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    notes: formData.get("notes"),
    difficulty: formData.get("difficulty"),
    habitAllowNegative: formData.get("habitAllowNegative"),
    repeatDays: formData.getAll("repeatDays"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const task = await createTask(session.user.id, goalId, parsed.data);
  if (!task) notFound();

  redirect(`/goals/${goalId}`);
}

export async function completeTodoAction(goalId: string, taskId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const task = await completeTodo(session.user.id, taskId);
  if (!task) notFound();

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/dashboard");
}

export async function completeDailyAction(goalId: string, taskId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const task = await completeDaily(session.user.id, taskId);
  if (!task) notFound();

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/dashboard");
}

export async function incrementHabitAction(
  goalId: string,
  taskId: string,
  direction: "positive" | "negative"
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const task = await incrementHabit(session.user.id, taskId, direction);
  if (!task) notFound();

  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/dashboard");
}

export async function archiveTaskAction(goalId: string, taskId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const task = await archiveTask(session.user.id, taskId);
  if (!task) notFound();

  revalidatePath(`/goals/${goalId}`);
}
