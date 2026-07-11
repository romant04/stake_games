import {
  Container,
  FillGradient,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  type Ticker,
} from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { Layout } from '../constants/layout';
import { formatNumber } from '../../utils/formatNumber';
import { getCurrencySymbol } from '../../utils/currencySymbols';
import { get } from 'svelte/store';
import { currency } from '../../../stores/game';
import { animateAlpha } from '../../utils/animateXandY';
import { sound } from '@pixi/sound';
import { SFX_VOLUME } from '../constants/game';

export class WinScreen {
  public readonly container: Container;
  private readonly winText: Text;

  public constructor(
    private readonly assets: GameAssets,
    private readonly ticker: Ticker,
    private winLabel: number,
  ) {
    this.container = new Container();
    this.container.position.set(Layout.CX, Layout.CY);

    const gradient = new FillGradient({
      type: 'radial',
      colorStops: [
        { offset: 0.15, color: '#26140DFF' },
        { offset: 1, color: '#26140D00' },
      ],
    });

    const graphics = new Graphics().circle(0, 0, 100).fill(gradient);
    graphics.width = 1000;
    graphics.height = 1000;
    this.container.addChild(graphics);

    const win = new Sprite(assets.win);
    win.anchor.set(0.5);
    win.position.set(0, -50);
    win.width = 628;
    win.height = 326;
    this.container.addChild(win);

    this.winText = new Text({
      text:
        formatNumber(this.winLabel) +
        ' ' +
        getCurrencySymbol(get(currency) as string),
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 75,
        fill: 0xeec53a,
        fontWeight: 'bold',

        stroke: {
          color: 0x531300,
          width: 8,
        },
      }),
    });
    this.winText.anchor.set(0.5);
    this.winText.position.set(20, 50);
    this.container.addChild(this.winText);

    this.container.visible = false;
  }

  public async show() {
    this.container.visible = true;
    this.container.alpha = 0;
    sound.play('win', { volume: SFX_VOLUME });
    await Promise.all([
      animateAlpha(this.ticker, this.container, 1, 500),
      this.animateWinAmount(this.winLabel),
    ]);
  }
  public async hide() {
    await animateAlpha(this.ticker, this.container, 0, 500);
    this.container.visible = false;
  }
  public setWinLabel(winLabel: number) {
    this.winLabel = winLabel;
  }

  public onOrientationChange(orientation: 'portrait' | 'landscape') {
    if (orientation === 'portrait') {
      this.rerenderToPortrait();
    } else {
      this.rerenderToLandscape();
    }
  }

  private async animateWinAmount(target: number) {
    const duration = 1000; // ms
    const start = performance.now();

    return new Promise<void>((resolve) => {
      const update = () => {
        const elapsed = performance.now() - start;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out effect
        const eased = 1 - Math.pow(1 - progress, 3);

        const current = Math.floor(target * eased);

        this.winText.text =
          formatNumber(current) +
          ' ' +
          getCurrencySymbol(get(currency) as string);

        if (progress >= 1) {
          this.ticker.remove(update);
          resolve();
        }
      };

      this.ticker.add(update);
    });
  }

  private rerenderToPortrait() {
    this.container.position.set(Layout.CX, Layout.CY + 200);
    this.container.scale.set(1.25);
  }

  private rerenderToLandscape() {
    this.container.position.set(Layout.CX, Layout.CY);
    this.container.scale.set(1);
  }
}
