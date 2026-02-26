export type TileType = 'sword' | 'heart' | 'shield' | 'star' | 'moon' | 'diamond';

export interface TileData {
  id: string;
  type: TileType;
  matched: boolean;
  isNew: boolean;
}

export type Board = TileData[][];
export type Position = { row: number; col: number };

export interface Effects {
  damage: number;
  heal: number;
  mana: number;
  shield: number;
  isCrit: boolean;
  matchCount: number;
  tileType: TileType;
}

export interface EnemyDef {
  name: string;
  baseHP: number;
  baseDamage: number;
  iconName: string;
  iconSet: 'mci' | 'ion';
  title: string;
}

export const GRID_SIZE = 6;
export const PLAYER_MAX_HP = 150;
export const PLAYER_MAX_MANA = 100;
export const ENEMIES_PER_WAVE = 5;
export const BASE_CRIT_CHANCE = 0.15;
export const CRIT_MULTIPLIER = 2.0;
export const COMBO_MULTIPLIER = 0.3;
export const XP_PER_MATCH = 10;
export const BASE_XP_REQUIRED = 100;

export function getXpRequired(level: number): number {
  return Math.floor(BASE_XP_REQUIRED * Math.pow(1.2, level - 1));
}

export const TILE_TYPES: TileType[] = ['sword', 'heart', 'shield', 'star', 'moon', 'diamond'];

export const TILE_CONFIG: Record<
  TileType,
  {
    iconName: string;
    iconSet: 'mci' | 'ion';
    bg: string;
    iconColor: string;
    border: string;
    glow: string;
    label: string;
  }
> = {
  sword: {
    iconName: 'sword',
    iconSet: 'mci',
    bg: '#8b0000',
    iconColor: '#ffaaaa',
    border: '#e60000',
    glow: '#ff3333',
    label: 'ATK',
  },
  heart: {
    iconName: 'heart',
    iconSet: 'ion',
    bg: '#8b004b',
    iconColor: '#ffaad4',
    border: '#e6007e',
    glow: '#ff33aa',
    label: 'HEAL',
  },
  shield: {
    iconName: 'shield',
    iconSet: 'ion',
    bg: '#00238b',
    iconColor: '#aac4ff',
    border: '#003be6',
    glow: '#3377ff',
    label: 'DEF',
  },
  star: {
    iconName: 'star',
    iconSet: 'ion',
    bg: '#8b5a00',
    iconColor: '#ffddaa',
    border: '#e69500',
    glow: '#ffcc33',
    label: 'MANA',
  },
  moon: {
    iconName: 'moon',
    iconSet: 'ion',
    bg: '#4b008b',
    iconColor: '#d4aaff',
    border: '#7e00e6',
    glow: '#aa33ff',
    label: 'SPEC',
  },
  diamond: {
    iconName: 'diamond',
    iconSet: 'mci',
    bg: '#008b8b',
    iconColor: '#aafff4',
    border: '#00e6e6',
    glow: '#33ffff',
    label: 'CRIT',
  },
};

export const WAVE_ENEMIES: EnemyDef[] = [
  { name: 'Goblin Scout', title: 'Weakling', baseHP: 80, baseDamage: 12, iconName: 'skull-outline', iconSet: 'ion' },
  { name: 'Orc Warrior', title: 'Berserker', baseHP: 130, baseDamage: 18, iconName: 'skull', iconSet: 'ion' },
  { name: 'Dark Mage', title: 'Sorcerer', baseHP: 100, baseDamage: 28, iconName: 'flame', iconSet: 'ion' },
  { name: 'Undead Knight', title: 'Revenant', baseHP: 200, baseDamage: 22, iconName: 'shield', iconSet: 'ion' },
  { name: 'Shadow Dragon', title: 'Boss', baseHP: 280, baseDamage: 35, iconName: 'flash', iconSet: 'ion' },
];

export function getEnemy(enemyIndex: number, wave: number) {
  const def = WAVE_ENEMIES[enemyIndex % WAVE_ENEMIES.length];
  const scale = Math.pow(1.25, wave - 1);
  return {
    name: def.name,
    title: def.title,
    maxHP: Math.floor(def.baseHP * scale),
    damage: Math.floor(def.baseDamage * scale),
    iconName: def.iconName,
    iconSet: def.iconSet as 'mci' | 'ion',
    level: (wave - 1) * ENEMIES_PER_WAVE + enemyIndex + 1,
  };
}

let tileCounter = 0;
export function nextTileId(): string {
  return `t${++tileCounter}`;
}

export function randomTileType(): TileType {
  return TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
}

export function createInitialBoard(): Board {
  const board: Board = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      board[row][col] = {
        id: nextTileId(),
        type: randomTileType(),
        matched: false,
        isNew: false,
      };
    }
  }
  return board;
}

export function findMatches(board: Board): Set<string> {
  const matched = new Set<string>();

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c <= GRID_SIZE - 3; c++) {
      const type = board[r][c].type;
      if (board[r][c + 1].type === type && board[r][c + 2].type === type) {
        let end = c + 2;
        while (end + 1 < GRID_SIZE && board[r][end + 1].type === type) end++;
        for (let i = c; i <= end; i++) matched.add(board[r][i].id);
        c = end - 1;
      }
    }
  }

  for (let col = 0; col < GRID_SIZE; col++) {
    for (let r = 0; r <= GRID_SIZE - 3; r++) {
      const type = board[r][col].type;
      if (board[r + 1][col].type === type && board[r + 2][col].type === type) {
        let end = r + 2;
        while (end + 1 < GRID_SIZE && board[end + 1][col].type === type) end++;
        for (let i = r; i <= end; i++) matched.add(board[i][col].id);
        r = end - 1;
      }
    }
  }

  return matched;
}

export function markMatches(board: Board, matchedIds: Set<string>): Board {
  return board.map(row =>
    row.map(tile =>
      matchedIds.has(tile.id) ? { ...tile, matched: true } : tile
    )
  );
}

export function dropAndRefill(board: Board): Board {
  const newBoard: Board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

  for (let col = 0; col < GRID_SIZE; col++) {
    const surviving: TileData[] = [];
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      if (!board[row][col].matched) {
        surviving.push({ ...board[row][col], isNew: false });
      }
    }
    for (let row = GRID_SIZE - 1; row >= 0; row--) {
      const idx = GRID_SIZE - 1 - row;
      if (idx < surviving.length) {
        newBoard[row][col] = surviving[idx];
      } else {
        newBoard[row][col] = {
          id: nextTileId(),
          type: randomTileType(),
          matched: false,
          isNew: true,
        };
      }
    }
  }

  return newBoard;
}

export function swapTiles(board: Board, a: Position, b: Position): Board {
  const newBoard = board.map(row => [...row]);
  const temp = newBoard[a.row][a.col];
  newBoard[a.row][a.col] = newBoard[b.row][b.col];
  newBoard[b.row][b.col] = temp;
  return newBoard;
}

export function isAdjacent(a: Position, b: Position): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export function calculateEffects(
  board: Board,
  matchedIds: Set<string>,
  combo: number,
  critActive: boolean
): Effects[] {
  const byType: Partial<Record<TileType, number>> = {};

  for (const row of board) {
    for (const tile of row) {
      if (matchedIds.has(tile.id)) {
        byType[tile.type] = (byType[tile.type] || 0) + 1;
      }
    }
  }

  const comboMult = 1 + combo * COMBO_MULTIPLIER;
  const matchSizeMult = matchedIds.size >= 5 ? 1.5 : matchedIds.size >= 4 ? 1.25 : 1.0;
  const totalMult = comboMult * matchSizeMult;
  const results: Effects[] = [];

  for (const [type, count] of Object.entries(byType) as [TileType, number][]) {
    const isCrit =
      type === 'diamond' ||
      critActive ||
      Math.random() < BASE_CRIT_CHANCE;

    const critMult = isCrit ? CRIT_MULTIPLIER : 1;

    let damage = 0;
    let heal = 0;
    let mana = 0;
    let shield = 0;

    switch (type) {
      case 'sword':
        damage = Math.floor(15 * count * totalMult * critMult);
        break;
      case 'heart':
        heal = Math.floor(12 * count);
        break;
      case 'shield':
        shield = Math.floor(8 * count);
        mana = Math.floor(3 * count);
        break;
      case 'star':
        mana = Math.floor(12 * count);
        break;
      case 'moon':
        damage = Math.floor(8 * count * totalMult * critMult);
        mana = Math.floor(6 * count);
        break;
      case 'diamond':
        damage = Math.floor(20 * count * totalMult * CRIT_MULTIPLIER);
        break;
    }

    results.push({ damage, heal, mana, shield, isCrit, matchCount: count, tileType: type });
  }

  return results;
}
