import { Sprite, Texture, Ticker } from 'pixi.js';
import { get } from 'svelte/store';
import { turboMode } from '../../stores/game';

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

  constructor(front: Texture, back: Texture, side: Texture, ticker: Ticker) {
    this.front = front;
    this.back = back;
    this.side = side;
    this.ticker = ticker;

    this.ticker.add(() => {
      this.update(this.ticker.deltaMS);
    });

    this.frames = [this.front, this.side, this.back, this.side];

    this.sprite = new Sprite(front);
    this.sprite.anchor.set(0.5);
    const size = 120;
    const scale = size / front.width;
    this.sprite.scale.set(scale);
  }

  update(deltaMS: number) {
    if (!this.isSpinning) return;

    //
    // frame progression
    //
    this.elapsed +=
      deltaMS * (get(turboMode) ? this.spinSpeed * 1.5 : this.spinSpeed);

    //
    // texture animation
    //
    if (this.elapsed >= 60) {
      this.elapsed = 0;

      this.frameIndex = (this.frameIndex + 1) % this.frames.length;

      this.sprite.texture = this.frames[this.frameIndex];
    }

    //
    // slowdown logic
    //
    if (this.stopRequested) {
      this.spinSpeed *= get(turboMode) ? 0.75 : 0.985;

      //
      // final stop threshold
      //
      if (this.spinSpeed <= 0.15) {
        this.isSpinning = false;

        this.applyResultVisual();
      }
    }
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
        break;
    }
  }

  startSpin(speed = 1.8) {
    this.spinSpeed = speed;
    this.isSpinning = true;
    this.stopRequested = false;
  }

  stopSpin(result: string) {
    this.result = result;
    this.stopRequested = true;
  }
}
