import { gameParticles } from './ParticleSystem';
import { PARTICLE_COLORS } from '../utils/colors';

export function emitLandingDust(x: number, y: number, intensity: number = 1): void {
  const count = Math.floor(3 + intensity * 2);
  gameParticles.emitBurst(x, y, count, {
    color: PARTICLE_COLORS.landingDust,
    size: 3 + intensity,
    lifetime: 300,
    spreadX: 80 * intensity,
    spreadY: 30,
    gravity: 200,
    friction: 0.95,
    fadeOut: true,
    shrink: true,
  });
}

export function emitJumpParticles(x: number, y: number): void {
  gameParticles.emitBurst(x, y + 10, 4, {
    color: PARTICLE_COLORS.jumpBurst,
    size: 3,
    lifetime: 200,
    spreadX: 40,
    spreadY: 20,
    gravity: 100,
    friction: 0.9,
    fadeOut: true,
    shrink: true,
  });
}

export function emitDashTrail(x: number, y: number, direction: number): void {
  const colors = PARTICLE_COLORS.dashTrail;
  for (let i = 0; i < 2; i++) {
    gameParticles.emit({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: -direction * (50 + Math.random() * 50),
      vy: (Math.random() - 0.5) * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 3,
      lifetime: 200 + Math.random() * 100,
      friction: 0.95,
      fadeOut: true,
      shrink: true,
    });
  }
}

export function emitDeathExplosion(x: number, y: number): void {
  gameParticles.emitBurst(x, y, 15, {
    colors: PARTICLE_COLORS.deathBurst,
    size: 5,
    lifetime: 400,
    spreadX: 150,
    spreadY: 100,
    gravity: 300,
    friction: 0.98,
    fadeOut: true,
    shrink: false,
  });
}

export function emitGoalSparkle(x: number, y: number, tileSize: number): void {
  if (Math.random() > 0.1) return; // Only 10% chance per frame

  gameParticles.emit({
    x: x + Math.random() * tileSize,
    y: y + Math.random() * tileSize,
    vx: (Math.random() - 0.5) * 20,
    vy: -20 - Math.random() * 30,
    color: PARTICLE_COLORS.goalSparkle,
    size: 2 + Math.random() * 2,
    lifetime: 500 + Math.random() * 300,
    gravity: -20,
    friction: 0.99,
    fadeOut: true,
    shrink: false,
  });
}

export function emitWallDust(x: number, y: number, side: 'left' | 'right'): void {
  const dir = side === 'left' ? 1 : -1;
  gameParticles.emitBurst(x, y, 3, {
    color: PARTICLE_COLORS.wallDust,
    size: 2,
    lifetime: 200,
    spreadX: 30 * dir,
    spreadY: 20,
    gravity: 100,
    friction: 0.9,
    fadeOut: true,
    shrink: true,
  });
}
