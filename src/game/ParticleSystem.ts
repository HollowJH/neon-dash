export interface ParticleConfig {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  size?: number;
  color?: string;
  lifetime?: number;
  gravity?: number;
  friction?: number;
  fadeOut?: boolean;
  shrink?: boolean;
}

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  lifetime: number;
  maxLifetime: number;
  gravity: number;
  friction: number;
  fadeOut: boolean;
  shrink: boolean;

  constructor(config: ParticleConfig) {
    this.x = config.x;
    this.y = config.y;
    this.vx = config.vx ?? 0;
    this.vy = config.vy ?? 0;
    this.size = config.size ?? 4;
    this.color = config.color ?? '#ffffff';
    this.lifetime = config.lifetime ?? 500;
    this.maxLifetime = this.lifetime;
    this.gravity = config.gravity ?? 0;
    this.friction = config.friction ?? 1;
    this.fadeOut = config.fadeOut ?? true;
    this.shrink = config.shrink ?? false;
  }

  update(deltaTime: number): boolean {
    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) return false;

    this.vy += this.gravity * (deltaTime / 1000);
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx * (deltaTime / 1000);
    this.y += this.vy * (deltaTime / 1000);

    return true;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const progress = 1 - (this.lifetime / this.maxLifetime);
    const alpha = this.fadeOut ? 1 - progress : 1;
    const size = this.shrink ? this.size * (1 - progress) : this.size;

    if (alpha <= 0 || size <= 0) return;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class ParticleEmitter {
  private particles: Particle[] = [];

  emit(config: ParticleConfig): void {
    this.particles.push(new Particle(config));
  }

  emitBurst(
    x: number,
    y: number,
    count: number,
    config: Omit<ParticleConfig, 'x' | 'y'> & {
      spreadX?: number;
      spreadY?: number;
      colors?: string[];
    }
  ): void {
    const { spreadX = 100, spreadY = 100, colors, ...rest } = config;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 50 + Math.random() * spreadX;
      const color = colors
        ? colors[Math.floor(Math.random() * colors.length)]
        : rest.color;

      this.emit({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - spreadY * Math.random(),
        color,
        ...rest,
      });
    }
  }

  update(deltaTime: number): void {
    this.particles = this.particles.filter(p => p.update(deltaTime));
  }

  render(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.particles) {
      particle.render(ctx);
    }
  }

  get count(): number {
    return this.particles.length;
  }

  clear(): void {
    this.particles = [];
  }
}

// Singleton emitter for game effects
export const gameParticles = new ParticleEmitter();
