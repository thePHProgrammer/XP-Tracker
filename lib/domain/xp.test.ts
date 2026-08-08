import { describe, expect, it } from "vitest";
import { DIFFICULTY_CONFIG, getLevelProgress, xpForLevel } from "./xp";

describe("xpForLevel", () => {
  it("grows with level", () => {
    expect(xpForLevel(1)).toBe(50);
    expect(xpForLevel(2)).toBeGreaterThan(xpForLevel(1));
    expect(xpForLevel(10)).toBeGreaterThan(xpForLevel(9));
  });
});

describe("getLevelProgress", () => {
  it("starts at level 1 with 0 xp", () => {
    expect(getLevelProgress(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: xpForLevel(1),
    });
  });

  it("stays level 1 just below the level-2 threshold", () => {
    const threshold = xpForLevel(1);
    const progress = getLevelProgress(threshold - 1);
    expect(progress.level).toBe(1);
    expect(progress.xpIntoLevel).toBe(threshold - 1);
  });

  it("crosses exactly to level 2 at the threshold", () => {
    const threshold = xpForLevel(1);
    const progress = getLevelProgress(threshold);
    expect(progress.level).toBe(2);
    expect(progress.xpIntoLevel).toBe(0);
  });

  it("handles a single completion that jumps multiple levels", () => {
    // Enough XP to blow past several early levels in one shot.
    const hugeXp = xpForLevel(1) + xpForLevel(2) + xpForLevel(3) + 5;
    const progress = getLevelProgress(hugeXp);
    expect(progress.level).toBe(4);
    expect(progress.xpIntoLevel).toBe(5);
  });

  it("never returns a negative xpIntoLevel for negative input", () => {
    const progress = getLevelProgress(-100);
    expect(progress.level).toBe(1);
    expect(progress.xpIntoLevel).toBe(0);
  });

  it("is consistent: level xp + progress reconstructs totalXp", () => {
    const totalXp = 12345;
    const progress = getLevelProgress(totalXp);
    let reconstructed = progress.xpIntoLevel;
    for (let lvl = 1; lvl < progress.level; lvl++) {
      reconstructed += xpForLevel(lvl);
    }
    expect(reconstructed).toBe(totalXp);
  });
});

describe("DIFFICULTY_CONFIG", () => {
  it("has all four difficulty tiers with positive values", () => {
    const keys = ["TRIVIAL", "EASY", "MEDIUM", "HARD"] as const;
    for (const key of keys) {
      const entry = DIFFICULTY_CONFIG[key];
      expect(entry.xp).toBeGreaterThan(0);
      expect(entry.gold).toBeGreaterThan(0);
      expect(entry.dailyMissHp).toBeGreaterThan(0);
    }
  });

  it("scales up with difficulty", () => {
    expect(DIFFICULTY_CONFIG.EASY.xp).toBeGreaterThan(
      DIFFICULTY_CONFIG.TRIVIAL.xp
    );
    expect(DIFFICULTY_CONFIG.MEDIUM.xp).toBeGreaterThan(
      DIFFICULTY_CONFIG.EASY.xp
    );
    expect(DIFFICULTY_CONFIG.HARD.xp).toBeGreaterThan(
      DIFFICULTY_CONFIG.MEDIUM.xp
    );
  });
});
