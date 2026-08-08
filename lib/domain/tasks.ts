import { prisma } from "@/lib/prisma";
import { DIFFICULTY_CONFIG, type DifficultyKey } from "@/lib/domain/xp";
import { getOwnedGoal } from "@/lib/domain/goals";

export async function listActiveTasks(userId: string, goalId: string) {
  return prisma.task.findMany({
    where: { userId, goalId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { checklist: { orderBy: { sortOrder: "asc" } } },
  });
}

// Ownership-scoped fetch: returns null if the task doesn't exist OR
// belongs to a different user.
export async function getOwnedTask(userId: string, taskId: string) {
  return prisma.task.findFirst({ where: { id: taskId, userId } });
}

export async function createTask(
  userId: string,
  goalId: string,
  data: {
    type: "HABIT" | "TODO";
    title: string;
    notes?: string;
    difficulty: DifficultyKey;
    habitAllowNegative?: boolean;
  }
) {
  const goal = await getOwnedGoal(userId, goalId);
  if (!goal) return null;

  const config = DIFFICULTY_CONFIG[data.difficulty];
  return prisma.task.create({
    data: {
      userId,
      goalId,
      type: data.type,
      title: data.title,
      notes: data.notes ?? null,
      difficulty: data.difficulty,
      xpValue: config.xp,
      goldValue: config.gold,
      habitAllowPositive: true,
      habitAllowNegative:
        data.type === "HABIT" ? Boolean(data.habitAllowNegative) : false,
    },
  });
}

export async function archiveTask(userId: string, taskId: string) {
  const task = await getOwnedTask(userId, taskId);
  if (!task) return null;
  return prisma.task.update({
    where: { id: task.id },
    data: { isActive: false },
  });
}

export async function completeTodo(userId: string, taskId: string) {
  const task = await getOwnedTask(userId, taskId);
  if (!task) return null;
  if (task.type !== "TODO" || task.completed) return task;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: task.id },
      data: { completed: true, completedAt: new Date() },
    });
    await tx.character.update({
      where: { userId },
      data: {
        totalXp: { increment: task.xpValue },
        gold: { increment: task.goldValue },
      },
    });
    await tx.goal.update({
      where: { id: task.goalId },
      data: { totalXp: { increment: task.xpValue } },
    });
    await tx.activityLog.create({
      data: {
        userId,
        goalId: task.goalId,
        taskId: task.id,
        type: "TODO_COMPLETED",
        xpDelta: task.xpValue,
        goldDelta: task.goldValue,
        message: `Completed "${task.title}"`,
      },
    });
    return updated;
  });
}

export async function incrementHabit(
  userId: string,
  taskId: string,
  direction: "positive" | "negative"
) {
  const task = await getOwnedTask(userId, taskId);
  if (!task || task.type !== "HABIT") return null;
  if (direction === "positive" && !task.habitAllowPositive) return task;
  if (direction === "negative" && !task.habitAllowNegative) return task;

  const config = DIFFICULTY_CONFIG[task.difficulty];

  return prisma.$transaction(async (tx) => {
    if (direction === "positive") {
      await tx.character.update({
        where: { userId },
        data: {
          totalXp: { increment: task.xpValue },
          gold: { increment: task.goldValue },
        },
      });
      await tx.goal.update({
        where: { id: task.goalId },
        data: { totalXp: { increment: task.xpValue } },
      });
      await tx.activityLog.create({
        data: {
          userId,
          goalId: task.goalId,
          taskId: task.id,
          type: "HABIT_POSITIVE",
          xpDelta: task.xpValue,
          goldDelta: task.goldValue,
          message: `+1 "${task.title}"`,
        },
      });
    } else {
      const character = await tx.character.findUniqueOrThrow({
        where: { userId },
      });
      const hpDelta = -Math.min(config.dailyMissHp, character.hp);
      await tx.character.update({
        where: { userId },
        data: { hp: { increment: hpDelta } },
      });
      await tx.activityLog.create({
        data: {
          userId,
          goalId: task.goalId,
          taskId: task.id,
          type: "HABIT_NEGATIVE",
          hpDelta,
          message: `-1 "${task.title}"`,
        },
      });
    }
    return tx.task.findUniqueOrThrow({ where: { id: task.id } });
  });
}
