import type { TileType, Level } from '../types/level';
import { TILE_SIZE } from '../types/level';

export const TILE_COLORS: Record<TileType, string> = {
  empty: '#1a1a2e',
  platform: '#4a5568',
  hazard: '#e53e3e',
  spawn: '#38a169',
  goal: '#d69e2e',
};

export function renderLevel(
  ctx: CanvasRenderingContext2D,
  level: Level,
  showGrid: boolean = true
) {
  const { width, height, tiles } = level;

  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width * TILE_SIZE, height * TILE_SIZE);

  // Draw tiles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileType = tiles[y][x];
      if (tileType !== 'empty') {
        ctx.fillStyle = TILE_COLORS[tileType];
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Add slight border for depth
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // Draw grid
  if (showGrid) {
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * TILE_SIZE, 0);
      ctx.lineTo(x * TILE_SIZE, height * TILE_SIZE);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE_SIZE);
      ctx.lineTo(width * TILE_SIZE, y * TILE_SIZE);
      ctx.stroke();
    }
  }
}

export function screenToGrid(screenX: number, screenY: number, canvasRect: DOMRect): { x: number; y: number } {
  const x = Math.floor((screenX - canvasRect.left) / TILE_SIZE);
  const y = Math.floor((screenY - canvasRect.top) / TILE_SIZE);
  return { x, y };
}
