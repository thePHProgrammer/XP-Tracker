"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import type { Task } from "@/app/generated/prisma/client";
import { getLevelProgress } from "@/lib/domain/xp";
import {
  completeDailyAction,
  completeTodoAction,
  incrementHabitAction,
} from "./tasks/actions";

type TaskLite = Pick<
  Task,
  | "id"
  | "type"
  | "title"
  | "difficulty"
  | "xpValue"
  | "goldValue"
  | "habitAllowPositive"
  | "habitAllowNegative"
  | "completed"
  | "completedToday"
  | "streak"
  | "repeatDays"
>;

type State = { totalXp: number; tasks: TaskLite[] };
type OptimisticAction =
  | { kind: "habit"; taskId: string }
  | { kind: "todo"; taskId: string }
  | { kind: "daily"; taskId: string };

function reduce(prev: State, action: OptimisticAction): State {
  const task = prev.tasks.find((t) => t.id === action.taskId);
  if (!task) return prev;

  if (action.kind === "habit") {
    return { ...prev, totalXp: prev.totalXp + task.xpValue };
  }

  if (action.kind === "todo") {
    if (task.completed) return prev;
    return {
      totalXp: prev.totalXp + task.xpValue,
      tasks: prev.tasks.map((t) =>
        t.id === action.taskId ? { ...t, completed: true } : t
      ),
    };
  }

  // daily
  if (task.completedToday) return prev;
  return {
    totalXp: prev.totalXp + task.xpValue,
    tasks: prev.tasks.map((t) =>
      t.id === action.taskId
        ? { ...t, completedToday: true, streak: t.streak + 1 }
        : t
    ),
  };
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TaskBoard({
  goalId,
  totalXp,
  tasks,
}: {
  goalId: string;
  totalXp: number;
  tasks: TaskLite[];
}) {
  const [state, applyOptimistic] = useOptimistic({ totalXp, tasks }, reduce);
  const [isPending, startTransition] = useTransition();

  const progress = getLevelProgress(state.totalXp);
  const percent = Math.min(
    100,
    Math.round((progress.xpIntoLevel / progress.xpForNextLevel) * 100)
  );

  const habits = state.tasks.filter((t) => t.type === "HABIT");
  const dailies = state.tasks.filter((t) => t.type === "DAILY");
  const todos = state.tasks.filter((t) => t.type === "TODO");

  function handleHabit(taskId: string, direction: "positive" | "negative") {
    startTransition(async () => {
      if (direction === "positive")
        applyOptimistic({ kind: "habit", taskId });
      await incrementHabitAction(goalId, taskId, direction);
    });
  }

  function handleCompleteTodo(taskId: string) {
    startTransition(async () => {
      applyOptimistic({ kind: "todo", taskId });
      await completeTodoAction(goalId, taskId);
    });
  }

  function handleCompleteDaily(taskId: string) {
    startTransition(async () => {
      applyOptimistic({ kind: "daily", taskId });
      await completeDailyAction(goalId, taskId);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-200">
            Level {progress.level}
          </span>
          <span className="text-neutral-500">
            {progress.xpIntoLevel} / {progress.xpForNextLevel} XP
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Link
          href={`/goals/${goalId}/tasks/new`}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          + New task
        </Link>
      </div>

      {habits.length === 0 && dailies.length === 0 && todos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-800 p-6 text-center text-sm text-neutral-500">
          No tasks yet. Add a habit, daily, or to-do to start earning XP.
        </div>
      ) : null}

      {dailies.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium uppercase text-neutral-500">
            Dailies
          </h3>
          {dailies.map((task) => (
            <label
              key={task.id}
              className={`flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3 ${
                task.completedToday ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={task.completedToday}
                disabled={task.completedToday || isPending}
                onChange={() => handleCompleteDaily(task.id)}
              />
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    task.completedToday ? "line-through" : ""
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-xs text-neutral-500">
                  {task.difficulty} - {task.xpValue} XP / {task.goldValue}{" "}
                  gold - streak {task.streak} -{" "}
                  {task.repeatDays.length === 7
                    ? "every day"
                    : task.repeatDays
                        .slice()
                        .sort()
                        .map((d) => WEEKDAY_LABELS[d])
                        .join("/")}
                </p>
              </div>
            </label>
          ))}
        </div>
      ) : null}

      {habits.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium uppercase text-neutral-500">
            Habits
          </h3>
          {habits.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-3"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-neutral-500">
                  {task.difficulty} - {task.xpValue} XP / {task.goldValue}{" "}
                  gold
                </p>
              </div>
              <div className="flex gap-2">
                {task.habitAllowNegative ? (
                  <button
                    type="button"
                    onClick={() => handleHabit(task.id, "negative")}
                    disabled={isPending}
                    className="rounded-md border border-neutral-700 px-3 py-1 text-red-400 transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    -
                  </button>
                ) : null}
                {task.habitAllowPositive ? (
                  <button
                    type="button"
                    onClick={() => handleHabit(task.id, "positive")}
                    disabled={isPending}
                    className="rounded-md border border-neutral-700 px-3 py-1 text-green-400 transition hover:bg-neutral-800 disabled:opacity-50"
                  >
                    +
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {todos.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium uppercase text-neutral-500">
            To-dos
          </h3>
          {todos.map((task) => (
            <label
              key={task.id}
              className={`flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3 ${
                task.completed ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                disabled={task.completed || isPending}
                onChange={() => handleCompleteTodo(task.id)}
              />
              <div>
                <p
                  className={`font-medium ${
                    task.completed ? "line-through" : ""
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-xs text-neutral-500">
                  {task.difficulty} - {task.xpValue} XP / {task.goldValue}{" "}
                  gold
                </p>
              </div>
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
