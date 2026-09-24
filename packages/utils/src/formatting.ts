/**
 * Format a win rate decimal (0-1) as a percentage string.
 * e.g. 0.523 => "52.3%"
 */
export function formatWinRate(rate: number): string {
  const pct = Math.round(rate * 1000) / 10;
  return `${pct}%`;
}

/**
 * Format a gold amount with the gold icon suffix.
 * e.g. 50 => "50g"
 */
export function formatGold(amount: number): string {
  return `${amount}g`;
}

/**
 * Format a placement number as an ordinal string.
 * e.g. 1 => "1st", 2 => "2nd", 3 => "3rd", 4 => "4th"
 */
export function formatPlacement(place: number): string {
  const ordinals: Record<number, string> = {
    1: '1st',
    2: '2nd',
    3: '3rd',
  };
  return ordinals[place] ?? `${place}th`;
}
