/**
 * Base roll odds by shop cost tier at each level.
 * Format: [cost1%, cost2%, cost3%, cost4%, cost5%]
 * Index corresponds to level (index 0 unused, levels 1-10).
 */
const ROLL_ODDS_TABLE: number[][] = [
  [],                              // 0 (unused)
  [100, 0, 0, 0, 0],               // Level 1
  [100, 0, 0, 0, 0],               // Level 2
  [75, 25, 0, 0, 0],               // Level 3
  [55, 30, 15, 0, 0],              // Level 4
  [45, 33, 20, 2, 0],              // Level 5
  [30, 40, 25, 5, 0],              // Level 6
  [19, 30, 35, 15, 1],             // Level 7
  [18, 25, 32, 22, 3],             // Level 8
  [10, 20, 25, 30, 15],            // Level 9
  [5, 10, 20, 40, 25],             // Level 10
];

/**
 * Calculate the probability of rolling a champion of a given cost
 * at a specific player level.
 *
 * @param level - Player level (1-10)
 * @param shopCost - Champion cost tier (1-5)
 * @returns Probability as a decimal (0-1)
 */
export function calculateRollOdds(level: number, shopCost: number): number {
  if (level < 1 || level > 10) {
    throw new Error(`Invalid level: ${level}. Must be between 1 and 10.`);
  }
  if (shopCost < 1 || shopCost > 5) {
    throw new Error(`Invalid shopCost: ${shopCost}. Must be between 1 and 5.`);
  }

  const odds = ROLL_ODDS_TABLE[level];
  if (!odds) return 0;

  return odds[shopCost - 1] / 100;
}
