export class ScreenShake {
  private intensity: number = 0;
  private decay: number = 0.9;
  offsetX: number = 0;
  offsetY: number = 0;

  trigger(intensity: number): void {
    this.intensity = Math.max(this.intensity, intensity);
  }

  update(): void {
    if (this.intensity < 0.5) {
      this.intensity = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      return;
    }

    this.offsetX = (Math.random() - 0.5) * this.intensity * 2;
    this.offsetY = (Math.random() - 0.5) * this.intensity * 2;
    this.intensity *= this.decay;
  }

  apply(ctx: CanvasRenderingContext2D): void {
    ctx.translate(this.offsetX, this.offsetY);
  }

  reset(): void {
    this.intensity = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }
}

export const screenShake = new ScreenShake();
