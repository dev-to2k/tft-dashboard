export interface TftChampion {
  id: string;
  slug: string;
  name: string;
  cost: 1 | 2 | 3 | 4 | 5;
  traits: string[];
  ability: {
    name: string;
    description: string;
    iconUrl: string;
    mana: {
      start: number;
      max: number;
    };
  };
  stats: {
    hp: number;
    armor: number;
    magicResist: number;
    attackDamage: number;
    attackSpeed: number;
    range: number;
  };
  iconUrl: string;
  setName: string;
}
