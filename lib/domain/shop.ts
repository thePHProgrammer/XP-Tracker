import { prisma } from "@/lib/prisma";

class InsufficientGoldError extends Error {}

export async function listRewards(userId: string) {
  return prisma.reward.findMany({
    where: { userId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getOwnedReward(userId: string, rewardId: string) {
  return prisma.reward.findFirst({ where: { id: rewardId, userId } });
}

export async function createReward(
  userId: string,
  data: {
    title: string;
    description?: string;
    goldCost: number;
    icon?: string;
  }
) {
  return prisma.reward.create({
    data: {
      userId,
      title: data.title,
      description: data.description ?? null,
      goldCost: data.goldCost,
      icon: data.icon ?? null,
    },
  });
}

export async function archiveReward(userId: string, rewardId: string) {
  const reward = await getOwnedReward(userId, rewardId);
  if (!reward) return null;
  return prisma.reward.update({
    where: { id: reward.id },
    data: { isActive: false },
  });
}

export async function purchaseReward(
  userId: string,
  rewardId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const reward = await getOwnedReward(userId, rewardId);
  if (!reward || !reward.isActive) {
    return { ok: false, error: "Reward not found." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Atomic conditional decrement: the WHERE clause re-checks the gold
      // balance at write time, so two concurrent purchases can't both
      // succeed and push gold negative.
      const lock = await tx.character.updateMany({
        where: { userId, gold: { gte: reward.goldCost } },
        data: { gold: { decrement: reward.goldCost } },
      });
      if (lock.count !== 1) throw new InsufficientGoldError();

      await tx.rewardPurchase.create({
        data: { userId, rewardId: reward.id, goldSpent: reward.goldCost },
      });
      await tx.activityLog.create({
        data: {
          userId,
          rewardId: reward.id,
          type: "REWARD_PURCHASED",
          goldDelta: -reward.goldCost,
          message: `Purchased "${reward.title}"`,
        },
      });
    });
  } catch (err) {
    if (err instanceof InsufficientGoldError) {
      return { ok: false, error: "Not enough gold." };
    }
    throw err;
  }

  return { ok: true };
}
