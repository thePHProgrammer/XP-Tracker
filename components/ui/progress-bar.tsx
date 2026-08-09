type Tone = "xp" | "hp" | "gold";

const toneClasses: Record<Tone, string> = {
  xp: "from-indigo-400 via-violet-400 to-fuchsia-400 shadow-[0_0_10px_rgba(99,102,241,0.7)]",
  hp: "from-rose-500 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]",
  gold: "from-amber-400 to-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.7)]",
};

export function ProgressBar({
  percent,
  tone = "xp",
  className = "",
}: {
  percent: number;
  tone?: Tone;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={`h-2.5 w-full overflow-hidden rounded-full bg-white/5 ${className}`}
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out ${toneClasses[tone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
