"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { updateUserSettings } from "@/lib/domain/character";
import { settingsSchema } from "@/lib/validation/settings";

export type FormState = { error: string } | { success: true } | undefined;

export async function updateSettingsAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await updateUserSettings(session.user.id, parsed.data);
  revalidatePath("/", "layout");

  return { success: true };
}
