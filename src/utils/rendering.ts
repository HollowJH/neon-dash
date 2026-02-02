import type { TileType, Level } from '../types/level';
import { CORE_COLORS, GLOW_COLORS, drawWithGlow } from './colors';

export const TILE_COLORS: Record<TileType, string> = {
  empty: CORE_COLORS.empty,
  platform: CORE_COLORS.platform,
  hazard: CORE_COLORS.hazard,
  spawn: CORE_COLORS.spawn,
  goal: CORE_COLORS.goal,
};

export const TILE_GLOW_COLORS: Record<TileType, string> = {
  empty: 'transparent',
  platform: GLOW_COLORS.platform,
  hazard: GLOW_COLORS.hazard,
  spawn: GLOW_COLORS.spawn,
  goal: GLOW_COLORS.goal,
};

export function renderLevel(
  ctx: CanvasRenderingContext2D,
  level: Level,
  showGrid: boolean = true,
  tileSize: number = 40,
  time: number = 0
): void {
  const { width, height, tiles } = level;

  // Clear canvas
  ctx.fillStyle = CORE_COLORS.background;
  ctx.fillRect(0, 0, width * tileSize, height * tileSize);

  // Draw tiles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileType = tiles[y][x];
      if (tileType !== 'empty') {
        let glowSize = 10;

        // Custom animations for specific tile types
        if (tileType === 'hazard') {
          glowSize = 10 + Math.sin(time * 0.005) * 5;
        } else if (tileType === 'goal') {
          glowSize = 15 + Math.sin(time * 0.003) * 8;
        }

        drawWithGlow(
          ctx,
          () => {
            ctx.fillStyle = TILE_COLORS[tileType];
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          },
          TILE_GLOW_COLORS[tileType],
          glowSize
        );

        // Add subtle glow line on top edge of platforms
        if (tileType === 'platform') {
          ctx.strokeStyle = GLOW_COLORS.platform;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x * tileSize, y * tileSize);
          ctx.lineTo((x + 1) * tileSize, y * tileSize);
          ctx.stroke();
        }

        // Add slight border for depth
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  // Draw grid
  if (showGrid) {
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * tileSize, 0);
      ctx.lineTo(x * tileSize, height * tileSize);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * tileSize);
      ctx.lineTo(width * tileSize, y * tileSize);
      ctx.stroke();
    }
  }
}

export function screenToGrid(
  screenX: number,
  screenY: number,
  canvasRect: DOMRect,
  tileSize: number = 40
): { x: number; y: number } {
  const x = Math.floor((screenX - canvasRect.left) / tileSize);
  const y = Math.floor((screenY - canvasRect.top) / tileSize);
  return { x, y };
}
