/**
 * XP required to level up at each level.
 * Index corresponds to current level (0 unused).
 */
const LEVEL_UP_COSTS: Array<{ gold: number; xpNeeded: number }> = [
  { gold: 0, xpNeeded: 0 },     // 0 (unused)
  { gold: 0, xpNeeded: 2 },    // Level 1 -> 2
  { gold: 0, xpNeeded: 2 },    // Level 2 -> 3
  { gold: 0, xpNeeded: 6 },    // Level 3 -> 4
  { gold: 0, xpNeeded: 10 },   // Level 4 -> 5
  { gold: 0, xpNeeded: 20 },   // Level 5 -> 6
  { gold: 0, xpNeeded: 36 },   // Level 6 -> 7
  { gold: 0, xpNeeded: 48 },   // Level 7 -> 8
  { gold: 0, xpNeeded: 76 },   // Level 8 -> 9
  { gold: 0, xpNeeded: 80 },   // Level 9 -> 10
  { gold: 0, xpNeeded: 0 },    // Level 10 (max)
];

/**
 * Gold costs for buying XP at each level.
 */
const BUY_XP_GOLD: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 4,
  5: 8,
  6: 12,
  7: 20,
  8: 32,
  9: 48,
  10: 0,
};

/**
 * Get the gold cost and XP needed to level up from the current level.
 */
export function getLevelUpCost(currentLevel: number): {
  gold: number;
  xpNeeded: number;
} {
  if (currentLevel < 1 || currentLevel > 10) {
    throw new Error(`Invalid level: ${currentLevel}. Must be between 1 and 10.`);
  }

  if (currentLevel >= 10) {
    return { gold: 0, xpNeeded: 0 };
  }

  const cost = LEVEL_UP_COSTS[currentLevel];
  const buyXpGold = BUY_XP_GOLD[currentLevel] ?? 0;

  return {
    gold: buyXpGold,
    xpNeeded: cost.xpNeeded,
  };
}

/**
 * Get passive XP gained per round at a given level.
 * Higher levels grant slightly more passive XP.
 */
export function getXpPerRound(level: number): number {
  if (level < 1 || level > 10) {
    throw new Error(`Invalid level: ${level}. Must be between 1 and 10.`);
  }

  // Base XP per round increases slightly with level
  const baseXp = 2;
  const bonusXp = Math.floor((level - 1) / 3);
  return baseXp + bonusXp;
}
