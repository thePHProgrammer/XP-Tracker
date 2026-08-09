type Difficulty = "TRIVIAL" | "EASY" | "MEDIUM" | "HARD";

const styles: Record<Difficulty, string> = {
  TRIVIAL: "bg-slate-400/10 text-slate-300 border-slate-400/20",
  EASY: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  MEDIUM: "bg-amber-400/10 text-amber-300 border-amber-400/20",
  HARD: "bg-rose-400/10 text-rose-300 border-rose-400/20",
};

const labels: Record<Difficulty, string> = {
  TRIVIAL: "Trivial",
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[difficulty]}`}
    >
      {labels[difficulty]}
    </span>
  );
}
