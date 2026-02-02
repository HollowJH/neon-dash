// Core colors (WCAG AA compliant for accessibility)
export const CORE_COLORS = {
  background: '#0a0a1a',
  empty: '#0a0a1a',
  platform: '#4a5568',
  hazard: '#c53030',
  spawn: '#2f855a',
  goal: '#b7791f',
  player: '#4299e1',
  playerDashing: '#9f7aea',
} as const;

// Glow colors (decorative effects only)
export const GLOW_COLORS = {
  platform: '#6366f1',
  hazard: '#ff2d55',
  spawn: '#00ff88',
  goal: '#ffd700',
  player: '#00d4ff',
  playerDashing: '#ff00ff',
} as const;

// Particle colors
export const PARTICLE_COLORS = {
  dashTrail: ['#00d4ff', '#ff00ff', '#6366f1'],
  landingDust: '#4a4a6a',
  jumpBurst: '#4299e1',
  deathBurst: ['#ff2d55', '#ff6b8a', '#ffffff'],
  goalSparkle: '#ffd700',
  wallDust: '#6366f1',
} as const;

// Helper to draw with glow effect
export function drawWithGlow(
  ctx: CanvasRenderingContext2D,
  drawFn: () => void,
  glowColor: string,
  glowSize: number = 10
): void {
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = glowSize;
  drawFn();
  ctx.shadowBlur = 0;
  drawFn();
  ctx.restore();
}
