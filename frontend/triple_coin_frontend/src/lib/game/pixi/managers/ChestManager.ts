import { Container, type Texture } from 'pixi.js';
import { Chest } from '../objects/Chest';
import {
  CHEST_APPEAR_STAGGER,
  CHEST_OPEN_STAGGER,
  CHEST_SPACING,
} from '../constants/game';
import { CX, CY } from '../constants/layout';
import { wait } from '../utils/wait';

/**
 * Manages the three bonus-round chests.
 *
 * Owns the payout split logic and the opened-count counter that were
 * previously stored as static properties on `Chest`.
 */
export class ChestManager {
  readonly container: Container;

  private chests: Chest[] = [];
  private payouts: number[] = [];
  private openedCount = 0;

  private readonly onBonusComplete: () => void;

  constructor(
    private readonly closedTexture: Texture,
    private readonly openedTexture: Texture,
    /** Called once all three chests have been opened. */
    onBonusComplete: () => void,
  ) {
    this.container = new Container();
    this.onBonusComplete = onBonusComplete;
  }

  // ---------------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------------

  create(): void {
    this.destroyChests();

    for (let i = 0; i < 3; i++) {
      const chest = new Chest(this.closedTexture, this.openedTexture, (event) =>
        this.handleChestOpen(event),
      );
      chest.setPosition(CX + (i - 1) * CHEST_SPACING, CY);
      chest.sprite.visible = false;
      this.container.addChild(chest.sprite);
      this.chests.push(chest);
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Reset state and animate all chests appearing one by one.
   * @param totalPayout - The bonus payout to split across the three chests.
   */
  async show(totalPayout: number): Promise<void> {
    this.openedCount = 0;
    this.payouts = this.splitPayout(totalPayout);

    for (const [i, chest] of this.chests.entries()) {
      chest.reset();
      // Don't await — fire-and-forget so the stagger is just a setTimeout gap
      chest.appear();
      if (i < this.chests.length - 1) {
        await wait(CHEST_APPEAR_STAGGER);
      }
    }
  }

  hide(): void {
    this.container.visible = false;
  }

  show2(): void {
    this.container.visible = true;
  }

  /** Force-open any chests the player hasn't clicked yet. */
  openAll(): void {
    this.chests
      .filter((c) => !c.isOpened)
      .forEach((chest, i) => {
        const globalIndex = this.chests.indexOf(chest);
        setTimeout(() => {
          const isLast = this.openedCount + i + 1 === this.chests.length;
          chest.open(isLast, this.payouts[globalIndex]);
        }, i * CHEST_OPEN_STAGGER);
      });
  }

  destroy(): void {
    this.destroyChests();
    this.container.destroy();
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private handleChestOpen({
    payout,
    isLast,
  }: {
    payout: number;
    isLast: boolean;
  }): void {
    this.openedCount++;
    if (this.openedCount === this.chests.length) {
      this.onBonusComplete();
    }
  }

  /**
   * Splits `total` into three amounts where each is between 20 % and 60 %
   * of the total, and all three sum exactly to `total`.
   */
  private splitPayout(total: number): number[] {
    const min = Math.floor(total * 0.2);
    const max = Math.floor(total * 0.6);

    let a = min + Math.floor(Math.random() * (max - min));
    let b = min + Math.floor(Math.random() * (max - min));
    let c = total - a - b;

    if (c < min) {
      const diff = min - c;
      c += diff;
      a -= diff;
    } else if (c > max) {
      const diff = c - max;
      c -= diff;
      a += diff;
    }

    return [a, b, c];
  }

  private destroyChests(): void {
    this.chests.forEach((c) => c.destroy());
    this.chests = [];
    this.container.removeChildren();
  }
}
