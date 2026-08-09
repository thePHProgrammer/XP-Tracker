import {
  CheckCircle2,
  Flame,
  Gift,
  HeartCrack,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listActivity } from "@/lib/domain/history";
import { Card } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";
import { undoActivityAction } from "./actions";

const UNDOABLE_TYPES = new Set(["TODO_COMPLETED", "DAILY_COMPLETED"]);

const ACTIVITY_ICON: Record<string, { icon: typeof Plus; className: string }> = {
  HABIT_POSITIVE: { icon: Plus, className: "bg-emerald-500/15 text-emerald-300" },
  HABIT_NEGATIVE: { icon: Minus, className: "bg-rose-500/15 text-rose-300" },
  DAILY_COMPLETED: { icon: Flame, className: "bg-orange-500/15 text-orange-300" },
  DAILY_UNCOMPLETED: { icon: RotateCcw, className: "bg-white/10 text-neutral-400" },
  DAILY_MISSED_PENALTY: { icon: HeartCrack, className: "bg-rose-500/15 text-rose-300" },
  TODO_COMPLETED: { icon: CheckCircle2, className: "bg-emerald-500/15 text-emerald-300" },
  TODO_UNCOMPLETED: { icon: RotateCcw, className: "bg-white/10 text-neutral-400" },
  REWARD_PURCHASED: { icon: Gift, className: "bg-amber-500/15 text-amber-300" },
};

function formatDelta(label: string, value: number, suffix: string) {
  if (value === 0) return null;
  const positive = value > 0;
  return (
    <span
      key={label}
      className={positive ? "text-emerald-400" : "text-rose-400"}
    >
      {positive ? "+" : ""}
      {value} {suffix}
    </span>
  );
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { cursor } = await searchParams;
  const { items, nextCursor } = await listActivity(session.user.id, cursor);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">History</h1>

      {items.length === 0 ? (
        <Card className="border-dashed p-6 text-center text-sm text-neutral-500">
          No activity yet - complete a task to see it here.
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((activity) => {
            const isReversed = Boolean(activity.reversedAt);
            const canUndo = UNDOABLE_TYPES.has(activity.type) && !isReversed;
            const meta = ACTIVITY_ICON[activity.type] ?? {
              icon: CheckCircle2,
              className: "bg-white/10 text-neutral-400",
            };
            const Icon = meta.icon;
            return (
              <li key={activity.id}>
                <Card
                  className={`flex items-center justify-between gap-3 p-3.5 ${
                    isReversed ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.className}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p
                        className={`text-sm ${
                          isReversed
                            ? "text-neutral-500 line-through"
                            : "text-neutral-100"
                        }`}
                      >
                        {activity.message}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        {formatDelta("xp", activity.xpDelta, "XP")}
                        {formatDelta("gold", activity.goldDelta, "gold")}
                        {formatDelta("hp", activity.hpDelta, "HP")}
                        <span className="text-neutral-600">
                          {activity.createdAt.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {canUndo ? (
                    <form action={undoActivityAction.bind(null, activity.id)}>
                      <Button type="submit" variant="secondary" size="sm">
                        Undo
                      </Button>
                    </form>
                  ) : null}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {nextCursor ? (
        <LinkButton
          href={`/history?cursor=${nextCursor}`}
          variant="secondary"
          className="self-center"
        >
          Load more
        </LinkButton>
      ) : null}
    </div>
  );
}
