import { Container, Sprite, Texture, type Ticker } from 'pixi.js';
import { Coin, type CoinResult } from '../objects/Coin';
import {
  COIN_SPACING,
  SPIN_DURATION_NORMAL,
  SPIN_DURATION_TURBO,
  SPIN_SPEED_NORMAL,
  SPIN_SPEED_TURBO,
  STOP_DELAY_NORMAL,
  STOP_DELAY_TURBO,
} from '../constants/game';
import { CX, CY, VIRTUAL_WIDTH } from '../constants/layout';
import { wait } from '../utils/wait';
import type { GameAssets } from '../../../../types/assets';

/**
 * Manages the three spinning coins.
 *
 * Coordinate space: virtual 1920×1080. Do NOT pass real screen dimensions —
 * the stage scale handles mapping to real pixels.
 */
export class CoinManager {
  readonly container: Container;

  private coins: Coin[] = [];
  private turbo = false;

  constructor(
    private readonly assets: GameAssets,
    private readonly ticker: Ticker,
  ) {
    this.container = new Container();

    const coinsBackground = new Sprite(assets.coinsBg);
    coinsBackground.anchor.set(0.5);
    coinsBackground.position.set(CX, CY);
    coinsBackground.width = VIRTUAL_WIDTH / 2;
    coinsBackground.height = 450;
    this.container.addChild(coinsBackground);

    const logo = new Sprite(assets.logo);
    logo.anchor.set(0.5);
    logo.position.set(CX, CY - 270);
    logo.width = 630;
    logo.height = 360;
    this.container.addChild(logo);
  }

  // ---------------------------------------------------------------------------
  // Setup
  // ---------------------------------------------------------------------------

  /**
   * Creates the three coins and adds them to `this.container`.
   * Add `this.container` to the stage after calling this.
   */
  create(): void {
    this.destroyCoins();

    for (let i = 0; i < 3; i++) {
      const coin = new Coin(
        this.assets.coinFront,
        this.assets.coinFrontFlopped,
        this.assets.coinBack,
        this.assets.coinBackFlopped,
        this.assets.coinSide,
        this.ticker,
      );
      coin.setPosition(CX + (i - 1) * COIN_SPACING, CY);
      coin.setTurbo(this.turbo);
      this.container.addChild(coin.sprite);
      this.coins.push(coin);
    }
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Sync turbo state — call whenever the store value changes. */
  setTurbo(enabled: boolean): void {
    this.turbo = enabled;
    this.coins.forEach((c) => c.setTurbo(enabled));
  }

  async spin(results: CoinResult[]): Promise<void> {
    const speed = this.turbo ? SPIN_SPEED_TURBO : SPIN_SPEED_NORMAL;
    const duration = this.turbo ? SPIN_DURATION_TURBO : SPIN_DURATION_NORMAL;
    const stopDelay = this.turbo ? STOP_DELAY_TURBO : STOP_DELAY_NORMAL;

    this.coins.forEach((coin) => coin.startSpin(speed));

    await wait(duration);

    for (const [i, coin] of this.coins.entries()) {
      coin.stopSpin(results[i] as CoinResult);
      await wait(stopDelay);
    }

    while (this.coins.some((c) => c.isSpinning)) {
      await wait(16);
    }
  }

  show(): void {
    this.container.visible = true;
  }

  hide(): void {
    this.container.visible = false;
  }

  /** Clean up all coins (removes ticker listeners). */
  destroy(): void {
    this.destroyCoins();
    this.container.destroy();
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private destroyCoins(): void {
    this.coins.forEach((c) => c.destroy());
    this.coins = [];
  }
}
