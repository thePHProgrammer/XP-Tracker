"use client";

import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

/** Fires `visible = true` for a few seconds whenever `level` increases. */
export function useLevelUpToast(level: number) {
  const previousLevel = useRef(level);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (level > previousLevel.current) {
      setVisible(true);
      previousLevel.current = level;
      const timer = setTimeout(() => setVisible(false), 3200);
      return () => clearTimeout(timer);
    }
    previousLevel.current = level;
  }, [level]);

  return visible;
}

export function LevelUpToast({
  visible,
  level,
  label,
}: {
  visible: boolean;
  level: number;
  label: string;
}) {
  if (!visible) return null;
  return (
    <div
      role="status"
      className="animate-level-up fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-indigo-400/40 bg-gradient-to-br from-indigo-600 to-violet-700 px-5 py-4 shadow-2xl shadow-indigo-500/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
        <Star className="h-5 w-5 fill-amber-300 text-amber-300" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
          Level up!
        </p>
        <p className="text-lg font-bold text-white">
          {label} - Level {level}
        </p>
      </div>
    </div>
  );
}
