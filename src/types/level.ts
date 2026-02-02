export type TileType = 'empty' | 'platform' | 'hazard' | 'spawn' | 'goal';

export interface Tile {
  type: TileType;
}

export interface Level {
  width: number;
  height: number;
  tiles: TileType[][];
}

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Position;
  velocity: Position;
  isGrounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
}

export const TILE_SIZE = 40;
export const GRID_WIDTH = 20;
export const GRID_HEIGHT = 12;

export function createEmptyLevel(): Level {
  const tiles: TileType[][] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    tiles[y] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      tiles[y][x] = 'empty';
    }
  }
  return { width: GRID_WIDTH, height: GRID_HEIGHT, tiles };
}
