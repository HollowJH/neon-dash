// Procedural audio using Web Audio API
// Generates retro synth sounds that match the neon aesthetic

export type SoundType = 'jump' | 'land' | 'dash' | 'death' | 'goal' | 'wallSlide';

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private volume = 0.25;
  private initialized = false;

  // Initialize on first user interaction (required by browsers)
  init(): void {
    if (this.initialized) return;

    try {
      this.ctx = new AudioContext();
      this.initialized = true;
    } catch {
      console.warn('Web Audio API not supported');
    }
  }

  // Resume context if suspended (browsers suspend until user gesture)
  private async ensureResumed(): Promise<boolean> {
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        return false;
      }
    }
    return true;
  }

  async play(sound: SoundType): Promise<void> {
    if (!this.enabled || !this.ctx) return;
    if (!(await this.ensureResumed())) return;

    switch (sound) {
      case 'jump':
        this.playTone(280, 0.08, 'square', 400);
        break;
      case 'land':
        this.playNoise(0.04);
        break;
      case 'dash':
        this.playSweep(300, 600, 0.12);
        break;
      case 'death':
        this.playSweep(400, 80, 0.35);
        break;
      case 'goal':
        this.playArpeggio([523, 659, 784, 1047], 0.08);
        break;
      case 'wallSlide':
        this.playNoise(0.015, 0.08);
        break;
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    endFreq?: number
  ): void {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) {
      osc.frequency.linearRampToValueAtTime(endFreq, now + duration);
    }

    gain.gain.setValueAtTime(this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  private playNoise(duration: number, volume = this.volume): void {
    if (!this.ctx) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const now = this.ctx.currentTime;

    // Low-pass filter for softer landing thud
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    noise.buffer = buffer;
    gain.gain.setValueAtTime(volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  private playSweep(startFreq: number, endFreq: number, duration: number): void {
    this.playTone(startFreq, duration, 'sawtooth', endFreq);
  }

  private playArpeggio(freqs: number[], noteLength: number): void {
    freqs.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, noteLength, 'square');
      }, i * noteLength * 700);
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const soundManager = new SoundManager();
