const MAX_BOARD_SIZE = 8;
const MIN_LEVEL = 1;
const MAX_LEVEL = 10;

/**
 * Check if a board unit count is valid (0 to MAX_BOARD_SIZE).
 */
export function isValidBoardSize(count: number): boolean {
  return Number.isInteger(count) && count >= 0 && count <= MAX_BOARD_SIZE;
}

/**
 * Check if a player level is valid (1-10).
 */
export function isValidLevel(level: number): boolean {
  return Number.isInteger(level) && level >= MIN_LEVEL && level <= MAX_LEVEL;
}
