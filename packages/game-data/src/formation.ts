export interface FormationUnit {
  /** Board id (slug) placed on the board. */
  id: string;
  traits: string[];
  /** Attack range: 1 = melee, higher = ranged. */
  range: number;
  /** The comp's main carry — always protected in the backline. */
  isCarry?: boolean;
}

export interface CompFormationInput {
  champions: string[];
  carry: string;
}

export const FORMATION_BOARD_SLOTS = 28;

// Frontline traits across sets (matched case-insensitively, substring).
// Melee units are caught by range <= 1 below; this list is for tank traits
// that ranged units can also carry (e.g. a ranged Vanguard).
// Vietnamese names come from the official client strings (Tiên Phong, ...).
const FRONTLINE_TRAIT_RE =
  /vanguard|juggernaut|defender|brawler|bruiser|bulwark|bastion|warden|guardian|titan|colossus|bodyguard|protector|sentinel|monolith|tiên phong|dũng sĩ|vệ quân|đấu sĩ|cự thạch|gai đen/i;

// TFT orientation: the enemy comes from the TOP, so tanks hold the TOP
// (front) rows and carries hide in the BOTTOM (back) rows.
// Top row first (closest to the enemy), filled center-out, then the row below.
const FRONT_SLOTS = [3, 2, 4, 1, 5, 0, 6, 10, 9, 11, 8, 12, 7, 13];
// Bottom row first (closest to the player), filled center-out, then the row above.
const BACK_SLOTS = [24, 23, 25, 22, 26, 21, 27, 17, 16, 18, 15, 19, 14, 20];

function isFrontline(unit: FormationUnit): boolean {
  if (unit.range <= 1) return true;
  return unit.traits.some((trait) => FRONTLINE_TRAIT_RE.test(trait));
}

/**
 * Map comp unit names to formation units via a caller-provided resolver
 * (usually built from Community Dragon champion data).
 */
export function toFormationUnits(
  comp: CompFormationInput,
  resolve: (name: string) => { id: string; traits: string[]; range: number } | null,
): FormationUnit[] {
  const units: FormationUnit[] = [];
  for (const name of comp.champions) {
    const resolved = resolve(name);
    if (!resolved) continue;
    units.push({ ...resolved, isCarry: name === comp.carry });
  }
  return units;
}

/**
 * Arrange comp units on the 28-slot board like a real TFT formation:
 * melee/tanky units hold the bottom (front) rows, the carry and ranged
 * units sit in the top (back) rows, both filled center-out.
 */
export function arrangeCompFormation(units: FormationUnit[]): (string | null)[] {
  const board: (string | null)[] = Array(FORMATION_BOARD_SLOTS).fill(null);
  const front = units.filter((unit) => !unit.isCarry && isFrontline(unit));
  const back = units.filter((unit) => unit.isCarry || !isFrontline(unit));
  // Carry first so it claims the safest center-back hex.
  back.sort((a, b) => Number(b.isCarry ?? false) - Number(a.isCarry ?? false));

  const leftovers: FormationUnit[] = [];
  front.forEach((unit, i) => {
    if (i < FRONT_SLOTS.length) board[FRONT_SLOTS[i]] = unit.id;
    else leftovers.push(unit);
  });
  back.forEach((unit, i) => {
    if (i < BACK_SLOTS.length) board[BACK_SLOTS[i]] = unit.id;
    else leftovers.push(unit);
  });
  for (const unit of leftovers) {
    const empty = board.indexOf(null);
    if (empty === -1) break;
    board[empty] = unit.id;
  }
  return board;
}
