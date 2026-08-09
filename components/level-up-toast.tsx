"use client";

import { useEffect, useRef, useState } from "react";

/** Fires `visible = true` for a few seconds whenever `level` increases. */
export function useLevelUpToast(level: number) {
  const previousLevel = useRef(level);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (level > previousLevel.current) {
      setVisible(true);
      previousLevel.current = level;
      const timer = setTimeout(() => setVisible(false), 3000);
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
      className="animate-level-up fixed bottom-6 right-6 z-50 rounded-lg border border-indigo-500 bg-indigo-950 px-5 py-3 shadow-2xl shadow-indigo-500/30"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
        Level up!
      </p>
      <p className="text-lg font-bold text-white">
        {label} - Level {level}
      </p>
    </div>
  );
}
