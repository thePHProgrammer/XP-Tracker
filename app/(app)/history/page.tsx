import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listActivity } from "@/lib/domain/history";
import { undoActivityAction } from "./actions";

const UNDOABLE_TYPES = new Set(["TODO_COMPLETED", "DAILY_COMPLETED"]);

function formatDelta(label: string, value: number, suffix: string) {
  if (value === 0) return null;
  const sign = value > 0 ? "+" : "";
  return (
    <span key={label} className="text-neutral-400">
      {sign}
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
        <div className="rounded-lg border border-dashed border-neutral-800 p-6 text-center text-sm text-neutral-500">
          No activity yet - complete a task to see it here.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((activity) => {
            const isReversed = Boolean(activity.reversedAt);
            const canUndo = UNDOABLE_TYPES.has(activity.type) && !isReversed;
            return (
              <li
                key={activity.id}
                className={`flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-3 ${
                  isReversed ? "opacity-50" : ""
                }`}
              >
                <div>
                  <p
                    className={`text-sm ${
                      isReversed ? "line-through text-neutral-500" : ""
                    }`}
                  >
                    {activity.message}
                  </p>
                  <div className="mt-1 flex gap-3 text-xs">
                    {formatDelta("xp", activity.xpDelta, "XP")}
                    {formatDelta("gold", activity.goldDelta, "gold")}
                    {formatDelta("hp", activity.hpDelta, "HP")}
                    <span className="text-neutral-600">
                      {activity.createdAt.toLocaleString()}
                    </span>
                  </div>
                </div>
                {canUndo ? (
                  <form action={undoActivityAction.bind(null, activity.id)}>
                    <button
                      type="submit"
                      className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-200"
                    >
                      Undo
                    </button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {nextCursor ? (
        <Link
          href={`/history?cursor=${nextCursor}`}
          className="self-center rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition hover:bg-neutral-900"
        >
          Load more
        </Link>
      ) : null}
    </div>
  );
}
