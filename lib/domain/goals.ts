import { prisma } from "@/lib/prisma";
import type { GoalStatus } from "@/app/generated/prisma/enums";

export async function listGoals(userId: string) {
  return prisma.goal.findMany({
    where: { userId, status: { not: "ARCHIVED" } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

// Ownership-scoped fetch: returns null if the goal doesn't exist OR
// belongs to a different user - callers should treat both the same way
// (notFound()), never leaking which case it was.
export async function getOwnedGoal(userId: string, goalId: string) {
  return prisma.goal.findFirst({ where: { id: goalId, userId } });
}

export async function createGoal(
  userId: string,
  data: { title: string; description?: string; icon?: string }
) {
  return prisma.goal.create({
    data: {
      userId,
      title: data.title,
      description: data.description || null,
      icon: data.icon || null,
    },
  });
}

export async function updateGoal(
  userId: string,
  goalId: string,
  data: { title: string; description?: string; icon?: string }
) {
  const owned = await getOwnedGoal(userId, goalId);
  if (!owned) return null;

  return prisma.goal.update({
    where: { id: goalId },
    data: {
      title: data.title,
      description: data.description || null,
      icon: data.icon || null,
    },
  });
}

export async function setGoalStatus(
  userId: string,
  goalId: string,
  status: GoalStatus
) {
  const owned = await getOwnedGoal(userId, goalId);
  if (!owned) return null;

  return prisma.goal.update({ where: { id: goalId }, data: { status } });
}
