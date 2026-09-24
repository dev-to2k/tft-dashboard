/**
 * Map a tier letter to a CSS color class or hex value.
 */
export function tierToColor(tier: string): string {
  switch (tier.toUpperCase()) {
    case 'S':
      return '#ffd700'; // gold
    case 'A':
      return '#3b82f6'; // blue
    case 'B':
      return '#22c55e'; // green
    case 'C':
      return '#9ca3af'; // gray
    case 'D':
      return '#ef4444'; // red
    default:
      return '#9ca3af'; // fallback gray
  }
}

/**
 * Map a champion cost (1-5) to a CSS color class or hex value.
 */
export function costToColor(cost: number): string {
  switch (cost) {
    case 1:
      return '#9ca3af'; // gray
    case 2:
      return '#22c55e'; // green
    case 3:
      return '#3b82f6'; // blue
    case 4:
      return '#a855f7'; // purple
    case 5:
      return '#ffd700'; // gold
    default:
      return '#9ca3af'; // fallback gray
  }
}
