import { prisma } from "@/lib/prisma";
import { DIFFICULTY_CONFIG } from "@/lib/domain/xp";
import { startOfDayInTimeZone, weekdayInTimeZone } from "@/lib/domain/timezone";

/**
 * Lazy daily-rollover, run once per day per user on their next page load
 * (called from the (app) layout) rather than via a server-wide cron - see
 * the plan's Security/Cost notes for why (per-user timezones, no Vercel
 * Hobby cron limits to work around).
 *
 * A long gap between visits (e.g. a week away) is treated as a single
 * missed occurrence per Daily, not one penalty per skipped day - this
 * mirrors Habitica's own day-rollover behavior and keeps a long absence
 * from being unreasonably punishing.
 */
export async function recomputeDailyRollover(userId: string): Promise<void> {
  const character = await prisma.character.findUnique({ where: { userId } });
  if (!character) return;

  const now = new Date();
  const todayBoundary = startOfDayInTimeZone(now, character.timezone);

  if (character.lastRecomputedAt >= todayBoundary) return;

  await prisma.$transaction(async (tx) => {
    // Optimistic lock: only one concurrent request (e.g. two devices
    // loading the dashboard at once) gets to run the rollover.
    const lock = await tx.character.updateMany({
      where: { id: character.id, lastRecomputedAt: { lt: todayBoundary } },
      data: { lastRecomputedAt: now },
    });
    if (lock.count !== 1) return;

    // The calendar day that just ended, in the user's timezone.
    const closingDayStart = new Date(
      todayBoundary.getTime() - 24 * 60 * 60 * 1000
    );
    const closingWeekday = weekdayInTimeZone(
      closingDayStart,
      character.timezone
    );

    const dailies = await tx.task.findMany({
      where: { userId, type: "DAILY", isActive: true },
    });

    for (const daily of dailies) {
      const wasDue = daily.repeatDays.includes(closingWeekday);
      // Derived from lastCompletedAt rather than trusting the
      // completedToday flag directly - that flag only gets reset by this
      // very function, so after a multi-day gap it can still read `true`
      // from a completion several days ago. Checking the timestamp against
      // the closing day's window is what actually answers "was it done for
      // the day that just ended".
      const completedOnClosingDay =
        daily.lastCompletedAt != null &&
        daily.lastCompletedAt >= closingDayStart &&
        daily.lastCompletedAt < todayBoundary;
      const missed = wasDue && !completedOnClosingDay;

      if (missed) {
        const config = DIFFICULTY_CONFIG[daily.difficulty];
        const freshCharacter = await tx.character.findUniqueOrThrow({
          where: { userId },
        });
        const hpDelta = -Math.min(config.dailyMissHp, freshCharacter.hp);
        await tx.character.update({
          where: { userId },
          data: { hp: { increment: hpDelta } },
        });
        await tx.activityLog.create({
          data: {
            userId,
            goalId: daily.goalId,
            taskId: daily.id,
            type: "DAILY_MISSED_PENALTY",
            hpDelta,
            message: `Missed "${daily.title}"`,
          },
        });
      }

      if (missed || daily.completedToday) {
        await tx.task.update({
          where: { id: daily.id },
          data: {
            completedToday: false,
            ...(missed ? { streak: 0 } : {}),
          },
        });
      }
    }
  });
}
