import {
  AnimatedSprite,
  BlurFilter,
  Container,
  FillGradient,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  Texture,
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
import { wait } from '../utils/wait';

export class WinScreen {
  public readonly container: Container;
  public readonly dimBackground: Sprite;
  private readonly winText: Text;
  private readonly win: AnimatedSprite;
  private readonly content: Container;

  public constructor(
    private readonly assets: GameAssets,
    private readonly ticker: Ticker,
    private winLabel: number,
  ) {
    this.container = new Container();

    // blurred background
    const overlay = new Container();

    const padding = 64;
    const blur = new BlurFilter({ strength: 25 });
    blur.padding = padding;

    overlay.filters = [blur];
    // Replace this.dimBackground = new Graphics() inside AutoplayMenu with:
    this.dimBackground = new Sprite(Texture.WHITE);
    this.dimBackground.tint = '#26140da6'; // Or color choice
    this.dimBackground.alpha = 0.75;
    this.dimBackground.eventMode = 'static';
    this.dimBackground.cursor = 'default';

    overlay.addChild(this.dimBackground);
    this.container.addChild(overlay);

    this.content = new Container();
    this.content.position.set(Layout.CX, Layout.CY);
    this.container.addChild(this.content);

    this.win = new AnimatedSprite(assets.win);
    this.win.anchor.set(0.5);
    this.win.position.set(0, 0);
    this.win.width = 1080;
    this.win.height = 1080;
    this.win.loop = false;
    this.win.animationSpeed = 0.75;
    this.content.addChild(this.win);

    this.winText = new Text({
      text:
        formatNumber(this.winLabel) +
        ' ' +
        getCurrencySymbol(get(currency) as string),
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 64,
        fill: 0xeec53a,
        fontWeight: 'bold',

        stroke: {
          color: 0x531300,
          width: 8,
        },
      }),
    });
    this.winText.anchor.set(0.5);
    this.winText.position.set(10, 75);
    this.content.addChild(this.winText);

    this.container.visible = false;
  }

  public async show() {
    this.container.visible = true;
    this.container.alpha = 1;
    sound.play('bonus-win', { volume: SFX_VOLUME });
    await Promise.all([
      this.win.gotoAndPlay(0),
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
    this.content.position.set(Layout.CX, Layout.CY);
  }

  private rerenderToLandscape() {
    this.content.position.set(Layout.CX, Layout.CY);
  }
}
