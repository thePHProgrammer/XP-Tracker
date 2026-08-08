// Pure, framework-independent XP/level math. No DB access here - callers
// pass in `totalXp` and get back the derived level/progress. Level is
// never stored; it's always computed from cumulative XP so a single large
// completion can never desync a stored level from stored XP.

const BASE_XP = 50;

export function xpForLevel(level: number): number {
  return Math.round(BASE_XP * Math.pow(level, 1.5));
}

export type LevelProgress = {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
};

export function getLevelProgress(totalXp: number): LevelProgress {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  let needed = xpForLevel(level);

  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = xpForLevel(level);
  }

  return { level, xpIntoLevel: remaining, xpForNextLevel: needed };
}

export const DIFFICULTY_CONFIG = {
  TRIVIAL: { xp: 5, gold: 2, dailyMissHp: 2 },
  EASY: { xp: 12, gold: 4, dailyMissHp: 4 },
  MEDIUM: { xp: 25, gold: 8, dailyMissHp: 7 },
  HARD: { xp: 45, gold: 15, dailyMissHp: 12 },
} as const;

export type DifficultyKey = keyof typeof DIFFICULTY_CONFIG;
