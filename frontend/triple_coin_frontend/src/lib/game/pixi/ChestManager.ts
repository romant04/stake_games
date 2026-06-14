import { Chest } from './Chest';
import type { Texture } from 'pixi.js';
import { get } from 'svelte/store';
import { bonusGameData } from '../../stores/game';
import { createAppearParticles } from '../utils/appearParticles';

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
      chest.setPosition(screenWidth / 2 + (i - 1) * 180, screenHeight / 2);
      chest.sprite.visible = false; // start hidden
      container.addChild(chest.sprite);
      this.chests.push(chest);
    }
  }

  setPositions(screenWidth: number, screenHeight: number) {
    this.chests.forEach((chest, i) => {
      chest.setPosition(screenWidth / 2 + (i - 1) * 180, screenHeight / 2);
    });
  }

  hide() {
    for (const chest of this.chests) {
      chest.sprite.visible = false;
    }
  }

  async show(index: number = 0) {
    if (index === 0) {
      Chest.openedChestsCount = 0;
      Chest.payouts = this.splitPayout(get(bonusGameData)?.payout || 0);
    }

    const chest = this.chests[index];
    chest.reset();
    chest.appear();

    if (index < this.chests.length - 1) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          this.show(index + 1).then(resolve);
        }, 500);
      });
    }
  }

  openAll() {
    this.chests
      .filter((x) => !x.isOpened)
      .forEach((chest, index) => {
        setTimeout(() => {
          chest.open();
        }, index * 1000); // 0s, 1s, 2s...
      });
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
