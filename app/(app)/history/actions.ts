"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { undoActivity } from "@/lib/domain/undo";

export async function undoActivityAction(activityId: string) {
  const session = await auth();
  if (!session?.user) return;

  await undoActivity(session.user.id, activityId);

  revalidatePath("/history");
  revalidatePath("/dashboard");
}
