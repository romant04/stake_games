import { Sprite, Texture, Text, Ticker, type Container } from 'pixi.js';
import { GlowFilter } from 'pixi-filters';
import { CHEST_APPEAR_FRAMES, CHEST_SIZE } from '../constants/game';
import type { GameAssets } from '../../../../types/assets';

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
  private readonly onOpen: (event: ChestOpenEvent) => void;

  constructor(
    /** Called with payout amount when this chest is opened. */
    private readonly assets: GameAssets,
    onOpen: (event: ChestOpenEvent) => void,
  ) {
    this.onOpen = onOpen;

    this.sprite = new Sprite(assets.chestClosed);
    this.sprite.anchor.set(0.5);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  setPosition(x: number, y: number): void {
    this.sprite.position.set(x, y);
  }

  /** Remove all ticker listeners. Call before destroying the sprite. */
  destroy(): void {
    this.sprite.destroy();
  }
}
