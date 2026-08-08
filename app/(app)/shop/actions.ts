"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { archiveReward, createReward, purchaseReward } from "@/lib/domain/shop";
import { rewardSchema } from "@/lib/validation/shop";

export type FormState = { error: string } | undefined;

export async function createRewardAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const parsed = rewardSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    goldCost: formData.get("goldCost"),
    icon: formData.get("icon"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await createReward(session.user.id, parsed.data);
  revalidatePath("/shop");
}

export async function purchaseRewardAction(rewardId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const result = await purchaseReward(session.user.id, rewardId);
  revalidatePath("/shop");
  revalidatePath("/dashboard");
  return result;
}

export async function archiveRewardAction(rewardId: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const reward = await archiveReward(session.user.id, rewardId);
  if (!reward) notFound();

  revalidatePath("/shop");
}
