import type { Level, TileType } from '../types/level';

export interface DemoLevel {
  id: string;
  name: string;
  hint?: string;
  data: Level;
}

// Helper to create level from string template
function createLevel(template: string[], width: number, height: number): Level {
  const tiles: TileType[][] = [];
  const charMap: Record<string, TileType> = {
    '.': 'empty',
    '#': 'platform',
    'X': 'hazard',
    'S': 'spawn',
    'G': 'goal',
  };

  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    const row = template[y] || '';
    for (let x = 0; x < width; x++) {
      const char = row[x] || '.';
      tiles[y][x] = charMap[char] || 'empty';
    }
  }

  return { width, height, tiles };
}

// Level 1: First Steps - Basic movement and jumping
// Max jump height ~2.5 tiles, so gaps and heights must be reachable
const level1Template = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..........................G...',
  '..........................#...',
  '..S...........###.........#...',
  '..#...........###....###..#...',
  '..#.......###........###..#...',
  '..#...###............###..#...',
  '##############################',
];

// Level 2: Hazard Zone - Introduces hazards (no dash/wall jump needed)
// Design: Ascending staircase with hazard pits below - miss a jump = death
// All jumps are 2-3 tiles horizontal, 1-2 tiles vertical (within reach)
const level2Template = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..........................G...',
  '........................###...',
  '....................###.......',
  '................###...........',
  '............###...............',
  '........###...................',
  '..S.###.......................',
  '####XXXX##XXXX##XXXX##XXXX####',
];

// Level 3: Speed Burst - Requires dash to cross hazard gap
// Dash covers ~2.5 tiles horizontal, gap is 5 tiles but elevated
const level3Template = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..........................G...',
  '.................###......#...',
  '..S..........###..........#...',
  '..#..........XXX..........#...',
  '..#......###..............#...',
  '..#..###..................#...',
  '######....XXXXX....#########..',
];

// Level 4: Vertical Climb - Wall jumps between parallel walls
// Design: Shorter climb with closer walls for easier wall jumping tutorial
// Walls are 3 tiles apart for comfortable back-and-forth climbing
const level4Template = [
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..............................',
  '..........G...................',
  '.........##...................',
  '.........#..#.................',
  '.........#..#.................',
  '...........#..................',
  '...........#..................',
  '.........#..#.................',
  '.........#..#.................',
  '..S......#....................',
  '..###....#....................',
  '##########XX##################',
];

// Level 5: Neon Gauntlet - Combines dash and wall jump
const level5Template = [
  '..............................',
  '..........................G...',
  '..........................#...',
  '..................#.......#...',
  '..................#.......#...',
  '..................#...........',
  '..................#...........',
  '..#...............#...........',
  '..#...............#...........',
  '..#...........................',
  '..#.......###.................',
  '..#..S....XXX.................',
  '..####....XXX.................',
  '..........XXX.................',
  '..........XXX.................',
  '######....XXXX....############',
];

export const DEMO_LEVELS: DemoLevel[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    data: createLevel(level1Template, 30, 16),
  },
  {
    id: 'hazard-zone',
    name: 'Hazard Zone',
    hint: 'Time your jumps carefully - the floor is lava!',
    data: createLevel(level2Template, 30, 16),
  },
  {
    id: 'speed-burst',
    name: 'Speed Burst',
    hint: 'Press SHIFT to dash across gaps!',
    data: createLevel(level3Template, 30, 16),
  },
  {
    id: 'vertical-climb',
    name: 'Vertical Climb',
    hint: 'Hold toward walls and press SPACE to wall jump!',
    data: createLevel(level4Template, 30, 16),
  },
  {
    id: 'neon-gauntlet',
    name: 'Neon Gauntlet',
    hint: 'Combine wall jumps and dashes to reach the goal!',
    data: createLevel(level5Template, 30, 16),
  },
];
