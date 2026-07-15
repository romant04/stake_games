import { Container, Sprite, type Ticker } from 'pixi.js';
import {
  CHEST_OPEN_STAGGER,
  CHEST_SPACING,
  SFX_VOLUME,
} from '../constants/game';
import type { GameAssets } from '../../../../types/assets';
import { ChestItem } from '../objects/ChestItem';
import { Layout } from '../constants/layout';
import { animateAlpha, animateY } from '../../utils/animateXandY';
import { sound } from '@pixi/sound';

/**
 * Manages the three bonus-round chests.
 *
 * Owns the payout split logic and the opened-count counter that were
 * previously stored as static properties on `Chest`.
 */
const CHEST_POSITIONS = {
  landscape: {
    positions: [
      { x: Layout.CX - CHEST_SPACING, y: Layout.CY + 240, spawnOffsetY: 200 },
      { x: Layout.CX, y: Layout.CY + 120, spawnOffsetY: 200 },
      { x: Layout.CX + CHEST_SPACING, y: Layout.CY + 240, spawnOffsetY: 200 },
    ],
    animationOrder: [1, 0, 2],
  },

  portrait: {
    positions: [
      { x: 250, y: Layout.CY + 500, spawnOffsetY: 500 },
      { x: 600, y: Layout.CY + 900, spawnOffsetY: 900 },
      { x: 750, y: Layout.CY + 300, spawnOffsetY: 300 },
    ],
    animationOrder: [1, 0, 2],
  },
} as const;
function getChestLayout() {
  const orientation = Layout.getOrientation();
  return CHEST_POSITIONS[orientation];
}

export class ChestManager {
  readonly container: Container;
  public readonly fog: Sprite;
  private chests: ChestItem[] = [];
  private payouts: number[] = [];
  private openedCount = 0;
  private readonly onBonusComplete: () => void;

  constructor(
    private readonly assets: GameAssets,
    private readonly ticker: Ticker,
    /** Called once all three chests have been opened. */
    onBonusComplete: () => void,
  ) {
    this.container = new Container();
    this.onBonusComplete = onBonusComplete;

    this.fog = new Sprite(assets.fog);
    this.fog.visible = false;
    this.container.addChild(this.fog);
  }

  // ---------------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------------

  create(): void {
    const layout = getChestLayout();

    for (let i = 0; i < 3; i++) {
      const chest = new ChestItem(this.assets, (event) =>
        this.handleChestOpen(event),
      );

      const pos = layout.positions[i];
      chest.container.position.set(pos.x, pos.y);

      chest.container.visible = false;
      this.container.addChild(chest.container);
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
      chest.payout = this.payouts[i];
      chest.payoutPercentage = Math.round((chest.payout / totalPayout) * 100);
    }

    const layout = getChestLayout();

    for (const index of layout.animationOrder) {
      sound.play('appear', { volume: SFX_VOLUME });
      await this.showChest(this.chests[index], index);
    }
  }

  async hide() {
    await Promise.all(
      this.chests.map((c) => animateAlpha(this.ticker, c.container, 0, 500)),
    );

    for (const [i, chest] of this.chests.entries()) {
      chest.reset();
      chest.container.visible = false;
      chest.container.alpha = 1; // Reset alpha for next time
    }
  }

  show2(): void {
    this.container.visible = true;
  }

  /** Force-open any chests the player hasn't clicked yet. */
  openAll(): void {
    this.chests
      .filter((c) => !c.chest.isOpened)
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

  public onOrientationChange() {
    const layout = getChestLayout();

    for (const [i, chest] of this.chests.entries()) {
      const pos = layout.positions[i];
      chest.container.position.set(pos.x, pos.y);
    }
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  public async showFog() {
    this.fog.visible = true;
    this.fog.alpha = 0;
    await animateAlpha(this.ticker, this.fog, 1, 500);
  }

  public async hideFog() {
    await animateAlpha(this.ticker, this.fog, 0, 500);
    this.fog.visible = false;
    this.container.visible = false; // Hide the entire container after the fog fades out
  }

  private async showChest(chest: ChestItem, index: number): Promise<void> {
    const layout = getChestLayout();
    const target = layout.positions[index];

    chest.container.position.set(
      target.x,
      target.y + layout.positions[index].spawnOffsetY,
    );

    chest.container.visible = true;

    await animateY(this.ticker, chest.container, target.y, 500);
  }

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
   * Splits `total` into three amounts where each is between 0% and 80%
   * of the total, and all three sum exactly to `total`.
   */
  private splitPayout(total: number): number[] {
    const min = Math.max(1, Math.floor(total * 0.1));
    const max = Math.floor(total * 0.8);

    // Ensure enough room for b and c
    const aMax = Math.min(max, total - 2 * min);
    const a = min + Math.floor(Math.random() * (aMax - min + 1));

    // Ensure enough room for c
    const bMax = Math.min(max, total - a - min);
    const b = min + Math.floor(Math.random() * (bMax - min + 1));

    const c = total - a - b;

    return [a, b, c];
  }

  private destroyChests(): void {
    this.chests.forEach((c) => c.chest.destroy());
    this.chests = [];
    this.container.removeChildren();
  }
}
