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

export const GRID_WIDTH = 30;
export const GRID_HEIGHT = 20;

export function createEmptyLevel(width: number = GRID_WIDTH, height: number = GRID_HEIGHT): Level {
  const tiles: TileType[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = 'empty';
    }
  }
  return { width, height, tiles };
}
