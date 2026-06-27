import { Sprite, Texture, type Ticker } from 'pixi.js';
import { GlowFilter } from 'pixi-filters';
import {
  COIN_SIZE,
  DECEL_NORMAL,
  DECEL_TURBO,
  GLOW_DURATION_NORMAL,
  GLOW_DURATION_TURBO,
  MIN_STOP_SPEED_NORMAL,
  MIN_STOP_SPEED_TURBO,
} from '../constants/game';

export type CoinResult = 'H' | 'T' | 'S';

/**
 * A single animated coin.
 *
 * Lifecycle:
 *   new Coin(...)  →  startSpin()  →  stopSpin(result)  →  isSpinning === false
 *
 * The coin registers exactly one ticker listener on construction. Call
 * `destroy()` when removing the coin from the stage to clean it up.
 */
export class Coin {
  readonly sprite: Sprite;

  isSpinning = false;

  // Cached from the store so we never call get() inside update()
  private turbo = false;

  private readonly frames: Texture[];
  private readonly frontFrames: Texture[];
  private readonly backFrames: Texture[];
  private readonly sideFrame: Texture;

  private readonly glowFilter: GlowFilter;

  private frameIndex = 0;
  private elapsed = 0;
  private spinSpeed = 1;
  private stopRequested = false;
  private result: CoinResult = 'H';

  private isGlowing = false;
  private glowIntroProgress = 0;
  private glowTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private baseScale: number;
  private currentScale: number;

  // Bound so we can pass it to ticker.add / ticker.remove
  private readonly tickerHandler: (ticker: Ticker) => void;

  constructor(
    frontFrames: Texture[],
    frontFlopped: Texture[],
    backFrames: Texture[],
    backFlopped: Texture[],
    sideFrame: Texture,
    private readonly ticker: Ticker,
  ) {
    this.frontFrames = frontFrames;
    this.backFrames = backFrames;
    this.sideFrame = sideFrame;

    // Full rotation sequence: front → side → back(flopped reverse) → back → side → front(flopped reverse)
    this.frames = [
      ...frontFrames,
      sideFrame,
      ...backFlopped.slice().reverse(),
      ...backFrames,
      sideFrame,
      ...frontFlopped.slice().reverse(),
    ];

    this.sprite = new Sprite(frontFrames[0]);
    this.sprite.anchor.set(0.5);

    this.baseScale = COIN_SIZE / frontFrames[0].width;
    this.currentScale = this.baseScale;
    this.sprite.scale.set(this.baseScale);

    this.glowFilter = new GlowFilter({
      distance: 15,
      outerStrength: 0,
      color: 0xffd700,
    });

    this.tickerHandler = (t) => this.update(t.deltaMS);
    this.ticker.add(this.tickerHandler);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  setPosition(x: number, y: number): void {
    this.sprite.position.set(x, y);
  }

  /** Call when turbo mode changes so update() never needs to read the store. */
  setTurbo(enabled: boolean): void {
    this.turbo = enabled;
  }

  startSpin(speed: number): void {
    this.cancelGlow();

    this.spinSpeed = speed;
    this.isSpinning = true;
    this.stopRequested = false;
  }

  stopSpin(result: CoinResult): void {
    this.result = result;
    this.stopRequested = true;
  }

  /** Remove the ticker listener. Call before destroying the sprite. */
  destroy(): void {
    this.cancelGlow();
    this.ticker.remove(this.tickerHandler);
    this.sprite.destroy();
  }

  // ---------------------------------------------------------------------------
  // Private — glow helpers
  // ---------------------------------------------------------------------------

  private turnOnGlow(): void {
    this.cancelGlow();

    this.isGlowing = true;
    this.glowIntroProgress = 0;
    this.glowFilter.outerStrength = 0;
    this.sprite.filters = [this.glowFilter];

    const duration = this.turbo ? GLOW_DURATION_TURBO : GLOW_DURATION_NORMAL;
    this.glowTimeoutId = setTimeout(() => this.turnOffGlow(), duration);
  }

  private turnOffGlow(): void {
    this.isGlowing = false;
    this.glowTimeoutId = null;
  }

  private cancelGlow(): void {
    if (this.glowTimeoutId !== null) {
      clearTimeout(this.glowTimeoutId);
      this.glowTimeoutId = null;
    }
    this.isGlowing = false;
    this.glowFilter.outerStrength = 0;
    this.sprite.filters = [];
    this.currentScale = this.baseScale;
    this.sprite.scale.set(this.baseScale);
  }

  // ---------------------------------------------------------------------------
  // Private — per-frame update
  // ---------------------------------------------------------------------------

  private update(deltaMS: number): void {
    const dt = deltaMS / 16.66;

    this.updateGlow(dt);
    this.updateSpin(deltaMS);
  }

  private updateGlow(dt: number): void {
    if (this.isGlowing) {
      if (this.glowIntroProgress < 1) {
        this.glowIntroProgress = Math.min(
          this.glowIntroProgress + 0.08 * dt,
          1,
        );
      }

      const speed = this.turbo ? 0.012 : 0.006;
      const now = Date.now();
      const pulse = 3.0 + Math.sin(now * speed) * 2.0;

      this.glowFilter.outerStrength = pulse * this.glowIntroProgress;
      this.glowFilter.distance =
        (12 + Math.sin(now * speed) * 6) * this.glowIntroProgress;
    } else if (this.glowFilter.outerStrength > 0) {
      this.glowFilter.outerStrength -= 0.1 * dt;
      if (this.glowFilter.outerStrength <= 0) {
        this.glowFilter.outerStrength = 0;
        this.sprite.filters = [];
      }
    }
  }

  private updateSpin(deltaMS: number): void {
    if (!this.isSpinning) return;

    const FRAME_TIME = 60;

    this.elapsed += deltaMS * this.spinSpeed;
    const steps = Math.floor(this.elapsed / FRAME_TIME);
    this.elapsed -= steps * FRAME_TIME;

    for (let i = 0; i < steps; i++) {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.sprite.texture = this.frames[this.frameIndex];
    }

    if (!this.stopRequested) return;

    const decel = this.turbo ? DECEL_TURBO : DECEL_NORMAL;
    const minSpeed = this.turbo ? MIN_STOP_SPEED_TURBO : MIN_STOP_SPEED_NORMAL;

    this.spinSpeed = Math.max(this.spinSpeed * decel, minSpeed);

    const stopFrame = this.getStopFrame(this.result);
    const distance =
      (stopFrame - this.frameIndex + this.frames.length) % this.frames.length;

    if (this.spinSpeed <= minSpeed && distance <= 1) {
      this.isSpinning = false;
      this.frameIndex = stopFrame;
      this.sprite.texture = this.frames[stopFrame];
      this.applyResultVisual();
    }
  }

  private applyResultVisual(): void {
    switch (this.result) {
      case 'H':
        this.sprite.texture = this.frontFrames[0];
        break;
      case 'T':
        this.sprite.texture = this.backFrames[0];
        break;
      case 'S':
        this.sprite.texture = this.sideFrame;
        this.turnOnGlow();
        break;
    }
  }

  private getStopFrame(result: CoinResult): number {
    const side1 = this.frontFrames.length;
    const backEnd = side1 + 1 + this.backFrames.length - 1;

    switch (result) {
      case 'H':
        return 0;
      case 'S':
        return side1;
      case 'T':
        return backEnd;
      default:
        return 0;
    }
  }
}
