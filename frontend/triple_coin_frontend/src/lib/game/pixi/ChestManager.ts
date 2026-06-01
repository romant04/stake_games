import { Chest } from './Chest';
import type { Texture } from 'pixi.js';
import { get } from 'svelte/store';
import { bonusGameData } from '../../stores/game';

export class ChestManager {
  chests: Chest[] = [];

  constructor(
    private closed: Texture,
    private opened: Texture,
  ) {}

  create(
    container: any,
    screenWidth: number,
    screenHeight: number,
    resetAfterBonus: () => void,
  ) {
    for (let i = 0; i < 3; i++) {
      const chest = new Chest(this.closed, this.opened, resetAfterBonus);
      chest.sprite.x = screenWidth / 2 + (i - 1) * 180;
      chest.sprite.y = screenHeight / 2;
      chest.sprite.visible = false; // start hidden
      container.addChild(chest.sprite);
      this.chests.push(chest);
    }
  }

  hide() {
    for (const chest of this.chests) {
      chest.sprite.visible = false;
    }
  }

  show() {
    Chest.openedChestsCount = 0;
    Chest.payouts = this.splitPayout(get(bonusGameData)?.payout || 0);

    for (const chest of this.chests) {
      chest.reset();
      chest.sprite.visible = true;
    }
  }

  private splitPayout(total: number) {
    const min = Math.floor(total * 0.2);
    const max = Math.floor(total * 0.6);

    let a = min + Math.floor(Math.random() * (max - min));
    let b = min + Math.floor(Math.random() * (max - min));

    let c = total - a - b;

    // fix edge cases
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
}
