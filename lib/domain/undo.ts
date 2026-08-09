import { prisma } from "@/lib/prisma";

// Habits are increment-only counters, not undoable - correcting a
// mis-click is just clicking the opposite direction. Only a To-Do or
// Daily completion can be undone.
const UNDOABLE_TYPES = ["TODO_COMPLETED", "DAILY_COMPLETED"] as const;

export async function undoActivity(userId: string, activityId: string) {
  const activity = await prisma.activityLog.findFirst({
    where: { id: activityId, userId },
  });
  if (!activity || activity.reversedAt) return null;
  if (!UNDOABLE_TYPES.includes(activity.type as (typeof UNDOABLE_TYPES)[number])) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    await tx.character.update({
      where: { userId },
      data: {
        totalXp: { decrement: activity.xpDelta },
        gold: { decrement: activity.goldDelta },
      },
    });

    if (activity.goalId) {
      await tx.goal.update({
        where: { id: activity.goalId },
        data: { totalXp: { decrement: activity.xpDelta } },
      });
    }

    if (activity.taskId) {
      if (activity.type === "TODO_COMPLETED") {
        await tx.task.update({
          where: { id: activity.taskId },
          data: { completed: false, completedAt: null },
        });
      } else if (activity.type === "DAILY_COMPLETED") {
        const task = await tx.task.findUnique({
          where: { id: activity.taskId },
        });
        if (task) {
          await tx.task.update({
            where: { id: activity.taskId },
            data: {
              completedToday: false,
              streak: Math.max(0, task.streak - 1),
            },
          });
        }
      }
    }

    const reversed = await tx.activityLog.update({
      where: { id: activity.id },
      data: { reversedAt: new Date() },
    });

    await tx.activityLog.create({
      data: {
        userId,
        goalId: activity.goalId,
        taskId: activity.taskId,
        type:
          activity.type === "TODO_COMPLETED"
            ? "TODO_UNCOMPLETED"
            : "DAILY_UNCOMPLETED",
        xpDelta: -activity.xpDelta,
        goldDelta: -activity.goldDelta,
        message: `Undid: ${activity.message}`,
      },
    });

    return reversed;
  });
}

// Convenience wrapper used by the "uncheck" UI action: finds the most
// recent not-yet-reversed completion for this task and undoes it, rather
// than the caller having to look up an ActivityLog id first.
export async function undoLatestForTask(userId: string, taskId: string) {
  const activity = await prisma.activityLog.findFirst({
    where: {
      userId,
      taskId,
      type: { in: [...UNDOABLE_TYPES] },
      reversedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });
  if (!activity) return null;
  return undoActivity(userId, activity.id);
}
