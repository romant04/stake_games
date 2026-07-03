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
import { wait } from '../utils/wait';
import type { GameAssets } from '../../../../types/assets';
import { Layout } from '../constants/layout';
import { animateX, animateY } from '../../utils/animateXandY';

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
  private readonly coinsContainer: Container;
  private readonly winTable: Sprite;

  constructor(
    private readonly assets: GameAssets,
    private readonly ticker: Ticker,
  ) {
    this.container = new Container();

    this.winTable = new Sprite(assets.winTable);
    this.winTable.anchor.set(0.5);
    this.winTable.position.set(Layout.VIRTUAL_WIDTH * 0.175, Layout.CY + 20);
    this.winTable.width = 600;
    this.winTable.height = 850;
    this.container.addChild(this.winTable);

    this.coinsContainer = new Container();
    this.coinsContainer.position.set(Layout.CX, Layout.CY);
    this.container.addChild(this.coinsContainer);
    const coinsBackground = new Sprite(assets.coinsBg);
    coinsBackground.anchor.set(0.5);
    coinsBackground.position.set(0, 0);
    coinsBackground.width = Layout.VIRTUAL_WIDTH / 2;
    coinsBackground.height = 450;
    this.coinsContainer.addChild(coinsBackground);

    const logo = new Sprite(assets.logo);
    logo.anchor.set(0.5);
    logo.position.set(Layout.CX, Layout.CY - 270);
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
      coin.setPosition((i - 1) * COIN_SPACING, 0);
      coin.setTurbo(this.turbo);
      this.coinsContainer.addChild(coin.sprite);
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

  async show(): Promise<void> {
    this.container.visible = true;

    this.coinsContainer.y = -Layout.CY;
    this.winTable.x = -Layout.VIRTUAL_WIDTH * 0.175 - 80;
    void animateY(this.ticker, this.coinsContainer, Layout.CY, 1000);
    await animateX(
      this.ticker,
      this.winTable,
      Layout.VIRTUAL_WIDTH * 0.175,
      1000,
    );
  }

  async hide(): Promise<void> {
    void animateY(this.ticker, this.coinsContainer, -Layout.CY, 1000);
    await animateX(
      this.ticker,
      this.winTable,
      -Layout.VIRTUAL_WIDTH * 0.175 - 80,
      1000,
    );

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
