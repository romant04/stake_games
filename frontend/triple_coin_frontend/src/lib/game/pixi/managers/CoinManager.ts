import { Container, Sprite, Texture, type Ticker } from 'pixi.js';
import { Coin, type CoinResult } from '../objects/Coin';
import {
  COIN_SPACING,
  SFX_VOLUME,
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
import { sound } from '@pixi/sound';
import { get, type Unsubscriber } from 'svelte/store';
import { isPlaying, turboMode } from '../../../stores/game';

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
  private readonly logo: Sprite;

  private readonly unsubscriber: Unsubscriber;

  constructor(
    private readonly assets: GameAssets,
    private readonly ticker: Ticker,
  ) {
    this.container = new Container();

    this.winTable = new Sprite(assets.winTable);
    this.winTable.anchor.set(0.5);
    this.winTable.position.set(Layout.VIRTUAL_WIDTH * 0.165, Layout.CY + 20);
    this.winTable.width = 600;
    this.winTable.height = 850;
    this.container.addChild(this.winTable);

    this.coinsContainer = new Container();
    this.coinsContainer.position.set(Layout.CX, Layout.CY);
    this.container.addChild(this.coinsContainer);
    const coinsBackground = new Sprite(assets.coinsBg);
    coinsBackground.anchor.set(0.5);
    coinsBackground.position.set(0, 0);
    coinsBackground.width = 1000;
    coinsBackground.height = 472;
    this.coinsContainer.addChild(coinsBackground);

    this.logo = new Sprite(assets.logo);
    this.logo.anchor.set(0.5);
    this.logo.position.set(Layout.CX, Layout.CY - 270);
    this.logo.width = 630;
    this.logo.height = 360;
    this.container.addChild(this.logo);

    this.unsubscriber = isPlaying.subscribe((playing) => {
      if (!playing) {
        sound.stop('spin');
      }
    });
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

  startSpin(): void {
    const speed = this.turbo ? SPIN_SPEED_TURBO : SPIN_SPEED_NORMAL;
    this.coins.forEach((coin) => coin.startSpin(speed));
    sound.play('spin', {
      volume: SFX_VOLUME,
      loop: true,
      speed: get(turboMode) ? 1 : 0.75,
    });
  }
  async stopSpin(results: CoinResult[]): Promise<void> {
    const stopDelay = this.turbo ? STOP_DELAY_TURBO : STOP_DELAY_NORMAL;

    for (const [i, coin] of this.coins.entries()) {
      coin.stopSpin(results[i] as CoinResult);
      await wait(stopDelay);
    }

    const start = performance.now();
    const MAX_WAIT = 5000; // safety cap
    while (
      this.coins.some((c) => c.isSpinning) &&
      performance.now() - start < MAX_WAIT
    ) {
      await wait(16);
    }
    sound.stop('spin');
  }

  async show(): Promise<void> {
    this.container.visible = true;

    this.coinsContainer.y = -Layout.CY;
    this.winTable.x = -Layout.VIRTUAL_WIDTH * 0.175 - 80;
    void animateY(
      this.ticker,
      this.coinsContainer,
      Layout.getOrientation() === 'landscape' ? Layout.CY : 675,
      1000,
    );
    await animateX(
      this.ticker,
      this.winTable,
      Layout.getOrientation() === 'landscape'
        ? Layout.VIRTUAL_WIDTH * 0.165
        : Layout.VIRTUAL_WIDTH * 0.275,
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
    this.unsubscriber();
    this.destroyCoins();
    this.container.destroy();
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  public onOrientationChange(orientation: 'landscape' | 'portrait') {
    if (orientation === 'portrait') {
      this.rerenderToPortrait();
    } else {
      this.rerenderToLandscape();
    }
  }

  private destroyCoins(): void {
    this.coins.forEach((c) => c.destroy());
    this.coins = [];
  }

  private rerenderToPortrait() {
    this.coinsContainer.position.set(Layout.CX, 675);
    this.logo.position.set(Layout.CX, 375);
    this.winTable.position.set(Layout.VIRTUAL_WIDTH * 0.275, Layout.CY + 350);
  }
  private rerenderToLandscape() {
    this.coinsContainer.position.set(Layout.CX, Layout.CY);
    this.logo.position.set(Layout.CX, Layout.CY - 270);
    this.winTable.position.set(Layout.VIRTUAL_WIDTH * 0.165, Layout.CY + 20);
  }
}
