import { Sprite, Texture, Ticker } from 'pixi.js';
import { get } from 'svelte/store';
import { turboMode } from '../../stores/game';
import { GlowFilter } from 'pixi-filters';

export class Coin {
  sprite: Sprite;

  front: Texture;
  back: Texture;
  side: Texture;

  ticker: Ticker;

  isSpinning = false;
  elapsed = 0;
  frame = 0;
  frames: Texture[] = [];

  spinSpeed = 1;
  frameIndex = 0;
  stopRequested = false;

  result: string = 'H';

  // --- Glow & Jackpot State Properties ---
  glowFilter: any = null;
  isGlowing = false;
  glowIntroProgress = 0;
  fadeInSpeed = 0.08; // Slightly faster fade-in for impact
  glowTimeoutId: any = null; // To track the auto-hide timer

  // Animation properties for a "juice" scale pop
  baseScale = 1;
  currentScale = 1;

  constructor(front: Texture, back: Texture, side: Texture, ticker: Ticker) {
    this.front = front;
    this.back = back;
    this.side = side;
    this.ticker = ticker;

    this.glowFilter = new GlowFilter({
      distance: 15,
      outerStrength: 0,
      color: 0xffd700,
    }) as any;

    this.ticker.add(() => {
      this.update(this.ticker.deltaMS);
    });

    this.frames = [this.front, this.side, this.back, this.side];

    this.sprite = new Sprite(front);
    this.sprite.anchor.set(0.5);
    const size = 120;
    this.baseScale = size / front.width;
    this.currentScale = this.baseScale;
    this.sprite.scale.set(this.baseScale);
  }

  update(deltaMS: number) {
    const dtNormalized = deltaMS / 16.66;

    // ----------------------------------------------------
    // Glow & Scale Pop Animation Logic
    // ----------------------------------------------------
    if (this.isGlowing) {
      // 1. Handle Intro Fade-in
      if (this.glowIntroProgress < 1) {
        this.glowIntroProgress += this.fadeInSpeed * dtNormalized;
        if (this.glowIntroProgress > 1) this.glowIntroProgress = 1;
      }

      // 2. Continuous Pulse Math (Faster in Turbo Mode)
      const speedModifier = get(turboMode) ? 0.012 : 0.006;
      const pulse = 3.0 + Math.sin(Date.now() * speedModifier) * 2.0;

      // 3. Apply Glow values
      this.glowFilter.outerStrength = pulse * this.glowIntroProgress;
      this.glowFilter.distance =
        (12 + Math.sin(Date.now() * speedModifier) * 6) *
        this.glowIntroProgress;

      // 4. Scale Pop "Juice" effect (bounces back down toward base scale)
      if (this.currentScale > this.baseScale) {
        this.currentScale -= 0.01 * dtNormalized;
        if (this.currentScale < this.baseScale)
          this.currentScale = this.baseScale;
        this.sprite.scale.set(this.currentScale);
      }
    } else if (this.glowFilter.outerStrength > 0) {
      // Smoothly fade out if glow is disabled or timed out
      this.glowFilter.outerStrength -= 0.1 * dtNormalized;
      if (this.glowFilter.outerStrength <= 0) {
        this.glowFilter.outerStrength = 0;
        this.sprite.filters = [];
      }
    }

    // ----------------------------------------------------
    // Spinning & Texture Animation Logic
    // ----------------------------------------------------
    if (!this.isSpinning) return;

    // frame progression
    this.elapsed +=
      deltaMS * (get(turboMode) ? this.spinSpeed * 1.5 : this.spinSpeed);

    // texture animation
    if (this.elapsed >= 60) {
      this.elapsed = 0;
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      this.sprite.texture = this.frames[this.frameIndex];
    }

    // slowdown logic
    if (this.stopRequested) {
      this.spinSpeed *= get(turboMode) ? 0.75 : 0.985;

      // final stop threshold
      if (this.spinSpeed <= 0.15) {
        this.isSpinning = false;
        this.applyResultVisual(); // This triggers when the coin fully halts!
      }
    }
  }

  turnOnJackpotGlow() {
    // Clear any existing pending fade-out timers
    if (this.glowTimeoutId) clearTimeout(this.glowTimeoutId);

    this.isGlowing = true;
    this.glowIntroProgress = 0;
    this.glowFilter.outerStrength = 0;
    this.sprite.filters = [this.glowFilter];

    // Give it a visual "pop" (scale it up 30% instantly, update handles bringing it back down)
    this.currentScale = this.baseScale * 1.3;
    this.sprite.scale.set(this.currentScale);

    // Set a timer to automatically turn off the glow after 3.5 seconds (3500ms)
    // Runs faster if turbo mode is on so the game keeps moving
    const displayDuration = get(turboMode) ? 1500 : 3500;

    this.glowTimeoutId = setTimeout(() => {
      this.turnOffGlow();
    }, displayDuration);
  }

  turnOffGlow() {
    this.isGlowing = false;
    // The update loop handles smoothly fading the filter out to 0 from here.
  }

  setPosition(x: number, y: number) {
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setResult(result: string) {
    this.result = result;
  }

  applyResultVisual() {
    switch (this.result) {
      case 'H':
        this.sprite.texture = this.front;
        break;

      case 'T':
        this.sprite.texture = this.back;
        break;

      case 'S':
        this.sprite.texture = this.side;
        this.turnOnJackpotGlow(); // Triggers perfectly right when the coin finishes stopping on S
        break;
    }
  }

  startSpin(speed = 1.8) {
    // CRITICAL: Force-kill the glow state and timers immediately if a new spin starts
    if (this.glowTimeoutId) {
      clearTimeout(this.glowTimeoutId);
      this.glowTimeoutId = null;
    }
    this.isGlowing = false;
    this.glowFilter.outerStrength = 0;
    this.sprite.filters = [];
    this.currentScale = this.baseScale;
    this.sprite.scale.set(this.baseScale);

    this.spinSpeed = speed;
    this.isSpinning = true;
    this.stopRequested = false;
  }

  stopSpin(result: string) {
    this.result = result;
    this.stopRequested = true;
  }
}
