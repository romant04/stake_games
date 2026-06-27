import { Sprite, Texture, Text, Ticker, type Container } from 'pixi.js';
import { GlowFilter } from 'pixi-filters';
import { CHEST_APPEAR_FRAMES, CHEST_SIZE } from '../constants/game';

export interface ChestOpenEvent {
  payout: number;
  isLast: boolean;
}

/**
 * A single chest object.
 *
 * All shared/static state has been removed. The ChestManager owns the payout
 * array and the opened-count counter, and passes values in when needed.
 *
 * Call `destroy()` to clean up ticker listeners before removing from the stage.
 */
export class Chest {
  readonly sprite: Sprite;
  isOpened = false;
  readonly baseScale: number;
  private readonly closedTexture: Texture;
  private readonly openedTexture: Texture;
  private readonly glowFilter: GlowFilter;
  private readonly onOpen: (event: ChestOpenEvent) => void;
  private pulseTime = 0;
  private pulseListenerActive = false;
  private readonly pulseHandler: (ticker: Ticker) => void;

  constructor(
    closed: Texture,
    opened: Texture,
    /** Called with payout amount when this chest is opened. */
    onOpen: (event: ChestOpenEvent) => void,
  ) {
    this.closedTexture = closed;
    this.openedTexture = opened;
    this.onOpen = onOpen;

    this.sprite = new Sprite(closed);
    this.sprite.anchor.set(0.5);

    this.baseScale = CHEST_SIZE / this.sprite.texture.width;
    this.sprite.scale.set(this.baseScale);

    this.glowFilter = new GlowFilter({
      distance: 15,
      outerStrength: 2,
      color: 0xffffff,
    });
    this.sprite.filters = [this.glowFilter];

    this.pulseHandler = (ticker: Ticker) => {
      this.pulseTime += ticker.deltaTime * 0.08;
      const pulse = (Math.sin(this.pulseTime) + 1) / 2;
      this.glowFilter.outerStrength = 1 + pulse * 4;
    };

    this.sprite.eventMode = 'static';
    this.sprite.cursor = 'pointer';
    this.sprite.on('pointerdown', () => this.open(false));
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  setPosition(x: number, y: number): void {
    this.sprite.position.set(x, y);
  }

  /**
   * Animate the chest appearing from scale 0.
   * Resolve when the animation finishes.
   */
  appear(): Promise<void> {
    this.sprite.scale.set(0);
    this.sprite.visible = true;

    return new Promise((resolve) => {
      let t = 0;
      const handler = (ticker: Ticker) => {
        t += ticker.deltaTime;
        const progress = Math.min(t / CHEST_APPEAR_FRAMES, 1);
        this.sprite.scale.set(this.baseScale * progress);

        if (progress >= 1) {
          Ticker.shared.remove(handler);
          resolve();
        }
      };
      Ticker.shared.add(handler);
    });
  }

  /**
   * Open this chest.
   * @param payout - The amount to display.
   * @param isLast - Whether this is the final chest (triggers bonus end).
   * @param auto   - `true` when opened programmatically (no click required).
   */
  open(isLast: boolean, payout?: number): void {
    if (this.isOpened) return;
    this.isOpened = true;

    this.stopPulse();
    this.sprite.texture = this.openedTexture;
    this.sprite.filters = [];

    this.onOpen({ payout: payout ?? 0, isLast });

    if (payout !== undefined) {
      this.spawnPayoutText(payout);
    }
  }

  /**
   * Reset to closed state so the chest can be reused.
   * Must be called before `appear()` on a second bonus round.
   */
  reset(): void {
    this.isOpened = false;
    this.sprite.texture = this.closedTexture;
    this.sprite.visible = false;
    this.sprite.filters = [this.glowFilter];
    this.pulseTime = 0;
    this.startPulse();
  }

  /** Remove all ticker listeners. Call before destroying the sprite. */
  destroy(): void {
    this.stopPulse();
    this.sprite.destroy();
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private startPulse(): void {
    if (this.pulseListenerActive) return;
    this.pulseListenerActive = true;
    Ticker.shared.add(this.pulseHandler);
  }

  private stopPulse(): void {
    if (!this.pulseListenerActive) return;
    this.pulseListenerActive = false;
    Ticker.shared.remove(this.pulseHandler);
  }

  private spawnPayoutText(payout: number): void {
    const parent = this.sprite.parent;
    if (!parent) return;

    const text = new Text({
      text: `+${payout}`,
      style: { fill: 0xffd700, fontSize: 36, fontWeight: 'bold' },
    });

    text.anchor.set(0.5);
    text.position.set(this.sprite.x, this.sprite.y - 100);
    text.scale.set(0.5);
    parent.addChild(text);

    let t = 0;
    let phase = 0;
    let holdFrames = 60;

    const handler = (ticker: Ticker) => {
      t += ticker.deltaTime;

      if (phase === 0) {
        text.scale.x += 0.08;
        text.scale.y += 0.08;
        if (text.scale.x >= 1.2) {
          text.scale.set(1.2);
          phase = 1;
        }
      } else if (phase === 1) {
        holdFrames -= ticker.deltaTime;
        text.scale.x = 1.2 + Math.sin(t * 0.2) * 0.05;
        text.scale.y = 1.2 + Math.sin(t * 0.2) * 0.05;
        if (holdFrames <= 0) phase = 2;
      } else {
        text.y -= 1.5;
        text.alpha -= 0.02;
        text.scale.x *= 0.98;
        text.scale.y *= 0.98;
        if (text.alpha <= 0) {
          Ticker.shared.remove(handler);
          text.destroy();
        }
      }
    };

    Ticker.shared.add(handler);
  }
}
