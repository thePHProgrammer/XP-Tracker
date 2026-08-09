"use client";

import { useOptimistic, useTransition } from "react";
import { Coins, Flame, Minus, Plus, Zap } from "lucide-react";
import type { Task } from "@/app/generated/prisma/client";
import { getLevelProgress } from "@/lib/domain/xp";
import { LevelUpToast, useLevelUpToast } from "@/components/level-up-toast";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import {
  completeDailyAction,
  completeTodoAction,
  incrementHabitAction,
  uncompleteTaskAction,
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
  | { kind: "todo-complete" | "todo-uncomplete"; taskId: string }
  | { kind: "daily-complete" | "daily-uncomplete"; taskId: string };

function reduce(prev: State, action: OptimisticAction): State {
  const task = prev.tasks.find((t) => t.id === action.taskId);
  if (!task) return prev;

  switch (action.kind) {
    case "habit":
      return { ...prev, totalXp: prev.totalXp + task.xpValue };

    case "todo-complete":
      if (task.completed) return prev;
      return {
        totalXp: prev.totalXp + task.xpValue,
        tasks: prev.tasks.map((t) =>
          t.id === action.taskId ? { ...t, completed: true } : t
        ),
      };

    case "todo-uncomplete":
      if (!task.completed) return prev;
      return {
        totalXp: prev.totalXp - task.xpValue,
        tasks: prev.tasks.map((t) =>
          t.id === action.taskId ? { ...t, completed: false } : t
        ),
      };

    case "daily-complete":
      if (task.completedToday) return prev;
      return {
        totalXp: prev.totalXp + task.xpValue,
        tasks: prev.tasks.map((t) =>
          t.id === action.taskId
            ? { ...t, completedToday: true, streak: t.streak + 1 }
            : t
        ),
      };

    case "daily-uncomplete":
      if (!task.completedToday) return prev;
      return {
        totalXp: prev.totalXp - task.xpValue,
        tasks: prev.tasks.map((t) =>
          t.id === action.taskId
            ? { ...t, completedToday: false, streak: Math.max(0, t.streak - 1) }
            : t
        ),
      };

    default:
      return prev;
  }
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function TaskMeta({ task }: { task: TaskLite }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      <DifficultyBadge difficulty={task.difficulty} />
      <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
        <Zap className="h-3 w-3" />
        {task.xpValue}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
        <Coins className="h-3 w-3" />
        {task.goldValue}
      </span>
    </div>
  );
}

export function TaskBoard({
  goalId,
  goalTitle,
  totalXp,
  tasks,
}: {
  goalId: string;
  goalTitle: string;
  totalXp: number;
  tasks: TaskLite[];
}) {
  const [state, applyOptimistic] = useOptimistic({ totalXp, tasks }, reduce);
  const [isPending, startTransition] = useTransition();

  const progress = getLevelProgress(state.totalXp);
  const percent = Math.round(
    (progress.xpIntoLevel / progress.xpForNextLevel) * 100
  );
  const showLevelUp = useLevelUpToast(progress.level);

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

  function handleToggleTodo(taskId: string, currentlyCompleted: boolean) {
    startTransition(async () => {
      if (currentlyCompleted) {
        applyOptimistic({ kind: "todo-uncomplete", taskId });
        await uncompleteTaskAction(goalId, taskId);
      } else {
        applyOptimistic({ kind: "todo-complete", taskId });
        await completeTodoAction(goalId, taskId);
      }
    });
  }

  function handleToggleDaily(taskId: string, currentlyCompleted: boolean) {
    startTransition(async () => {
      if (currentlyCompleted) {
        applyOptimistic({ kind: "daily-uncomplete", taskId });
        await uncompleteTaskAction(goalId, taskId);
      } else {
        applyOptimistic({ kind: "daily-complete", taskId });
        await completeDailyAction(goalId, taskId);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium text-neutral-100">
            Level {progress.level}
          </span>
          <span className="text-sm text-neutral-400">
            {progress.xpIntoLevel} / {progress.xpForNextLevel} XP
          </span>
        </div>
        <ProgressBar percent={percent} tone="xp" />
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <LinkButton href={`/goals/${goalId}/tasks/new`} size="sm">
          + New task
        </LinkButton>
      </div>

      {habits.length === 0 && dailies.length === 0 && todos.length === 0 ? (
        <Card className="border-dashed p-6 text-center text-sm text-neutral-500">
          No tasks yet. Add a habit, daily, or to-do to start earning XP.
        </Card>
      ) : null}

      {dailies.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Dailies
          </h3>
          {dailies.map((task) => (
            <Card
              key={task.id}
              className={`flex items-center gap-3 p-3.5 transition ${
                task.completedToday ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={task.completedToday}
                disabled={isPending}
                onChange={() =>
                  handleToggleDaily(task.id, task.completedToday)
                }
                className="h-5 w-5 accent-indigo-500"
              />
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    task.completedToday ? "line-through" : ""
                  }`}
                >
                  {task.title}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <DifficultyBadge difficulty={task.difficulty} />
                  <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
                    <Zap className="h-3 w-3" />
                    {task.xpValue}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                    <Coins className="h-3 w-3" />
                    {task.goldValue}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/20 bg-orange-400/10 px-2 py-0.5 text-[11px] font-medium text-orange-300">
                    <Flame className="h-3 w-3" />
                    {task.streak}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {task.repeatDays.length === 7
                      ? "every day"
                      : task.repeatDays
                          .slice()
                          .sort()
                          .map((d) => WEEKDAY_LABELS[d])
                          .join("/")}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {habits.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Habits
          </h3>
          {habits.map((task) => (
            <Card
              key={task.id}
              className="flex items-center justify-between p-3.5"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <TaskMeta task={task} />
              </div>
              <div className="flex gap-2">
                {task.habitAllowNegative ? (
                  <button
                    type="button"
                    onClick={() => handleHabit(task.id, "negative")}
                    disabled={isPending}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/20 active:scale-90 disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                ) : null}
                {task.habitAllowPositive ? (
                  <button
                    type="button"
                    onClick={() => handleHabit(task.id, "positive")}
                    disabled={isPending}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300 transition hover:bg-emerald-500/20 active:scale-90 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {todos.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            To-dos
          </h3>
          {todos.map((task) => (
            <Card
              key={task.id}
              className={`flex items-center gap-3 p-3.5 transition ${
                task.completed ? "opacity-50" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                disabled={isPending}
                onChange={() => handleToggleTodo(task.id, task.completed)}
                className="h-5 w-5 accent-indigo-500"
              />
              <div>
                <p
                  className={`font-medium ${
                    task.completed ? "line-through" : ""
                  }`}
                >
                  {task.title}
                </p>
                <TaskMeta task={task} />
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      <LevelUpToast
        visible={showLevelUp}
        level={progress.level}
        label={goalTitle}
      />
    </div>
  );
}
