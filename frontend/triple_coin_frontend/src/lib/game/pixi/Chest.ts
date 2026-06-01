import { Sprite, Texture, Text, Ticker } from 'pixi.js';
import { get } from 'svelte/store';
import { currency } from '../../stores/game';

export class Chest {
  static openedChestsCount = 0;
  static payouts: number[] = [];
  sprite: Sprite;
  opened: Texture;
  closed: Texture;

  baseScale: number;
  currentScale: number;
  resetAfterBonus: () => void;

  constructor(closed: Texture, opened: Texture, resetAfterBonus: () => void) {
    this.closed = closed;
    this.opened = opened;
    this.resetAfterBonus = resetAfterBonus;

    this.sprite = new Sprite(closed);
    this.sprite.anchor.set(0.5);
    const size = 150;
    this.baseScale = size / this.sprite.texture.width;
    this.currentScale = this.baseScale;
    this.sprite.scale.set(this.baseScale);

    this.sprite.eventMode = 'static';
    this.sprite.cursor = 'pointer';

    this.sprite.on('pointerdown', () => this.open());
  }

  open() {
    const payout = Chest.payouts[Chest.openedChestsCount];
    Chest.openedChestsCount++;

    this.sprite.texture = this.opened;
    console.log(`Chest opened! Payout: ${payout}`);

    const text = new Text({
      text: `+${payout} ${get(currency) ?? ''}`,
      style: {
        fill: 0xffd700,
        fontSize: 36,
        fontWeight: 'bold',
      },
    });

    text.anchor.set(0.5);
    text.position.set(this.sprite.x, this.sprite.y - 100);

    this.sprite.parent?.addChild(text);

    // initial state
    text.scale.set(0.5);
    text.alpha = 1;

    let t = 0;
    let phase = 0;
    let holdTime = 60; // frames (~1 sec at 60fps)

    const update = (ticker: Ticker) => {
      t += ticker.deltaTime;

      // PHASE 1: pop in
      if (phase === 0) {
        text.scale.x += 0.08;
        text.scale.y += 0.08;

        if (text.scale.x >= 1.2) {
          phase = 1;
          text.scale.set(1.2);
        }
      }

      // PHASE 2: hold (slight glow/bounce)
      else if (phase === 1) {
        holdTime -= ticker.deltaTime;

        text.scale.x = 1.2 + Math.sin(t * 0.2) * 0.05;
        text.scale.y = 1.2 + Math.sin(t * 0.2) * 0.05;

        if (holdTime <= 0) {
          phase = 2;
        }
      }

      // PHASE 3: float + fade out
      else {
        text.y -= 1.5;
        text.alpha -= 0.02;
        text.scale.x *= 0.98;
        text.scale.y *= 0.98;

        if (text.alpha <= 0) {
          Ticker.shared.remove(update);
          text.destroy();
        }
      }
    };

    Ticker.shared.add(update);

    if (Chest.openedChestsCount === 3) {
      this.resetAfterBonus();
    }
  }

  reset() {
    this.sprite.texture = this.closed;
  }
}
