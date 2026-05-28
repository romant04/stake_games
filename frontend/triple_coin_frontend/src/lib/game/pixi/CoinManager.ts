import { Coin } from './Coin';
import { Texture, type Ticker } from 'pixi.js';
import { get } from 'svelte/store';
import { turboMode } from '../../stores/game';

type Result = 'H' | 'T' | 'S';

export class CoinManager {
  coins: Coin[] = [];

  constructor(
    private front: Texture,
    private back: Texture,
    private side: Texture,
    private ticker: Ticker,
  ) {}

  create(container: any, screenWidth: number, screenHeight: number) {
    this.coins = [];

    for (let i = 0; i < 3; i++) {
      const coin = new Coin(this.front, this.back, this.side, this.ticker);

      coin.setPosition(screenWidth / 2 + (i - 1) * 180, screenHeight / 2);

      container.addChild(coin.sprite);
      console.log('coin created', coin);
      this.coins.push(coin);
    }
  }

  setPositions(screenWidth: number, screenHeight: number) {
    this.coins.forEach((coin, i) => {
      coin.setPosition(screenWidth / 2 + (i - 1) * 180, screenHeight / 2);
    });
  }

  async spin(results: string[]) {
    //
    // start all
    //
    this.coins.forEach((coin) => {
      coin.startSpin(1.75);
    });

    //
    // let them spin
    //
    await this.wait(get(turboMode) ? 600 : 1200);

    //
    // sequential stop
    //
    for (let i = 0; i < this.coins.length; i++) {
      this.coins[i].stopSpin(results[i]);

      await this.wait(get(turboMode) ? 400 : 750);
    }

    //
    // wait until all finished
    //
    while (this.coins.some((c) => c.isSpinning)) {
      await this.wait(16);
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
