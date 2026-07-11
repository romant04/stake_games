import {
  Container,
  Sprite,
  Text,
  TextStyle,
  type Texture,
  Ticker,
} from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { Chest, type ChestOpenEvent } from './Chest';
import { get } from 'svelte/store';
import { currency } from '../../../stores/game';
import { sound } from '@pixi/sound';
import { SFX_VOLUME } from '../constants/game';

export class ChestItem {
  readonly container: Container;

  public readonly chest: Chest;
  public payout: number = 0;
  public payoutPercentage: number = 0;
  private readonly labelText: Text;

  private readonly chestTextures: {
    chestOpened1: Texture[];
    chestOpened2: Texture[];
    chestOpened3: Texture[];
    chestOpened4: Texture[];
  };

  private readonly ticker: Ticker;

  public constructor(
    private readonly assets: GameAssets,
    private readonly onOpen: (event: ChestOpenEvent) => void,
  ) {
    this.container = new Container();
    this.ticker = new Ticker();
    this.ticker.start();

    const clickableContainer = new Container();
    clickableContainer.eventMode = 'static';
    clickableContainer.cursor = 'pointer';

    this.chestTextures = {
      chestOpened1: [
        assets.chest1Opened1,
        assets.chest1Opened2,
        assets.chest1Opened3,
      ],
      chestOpened2: [
        assets.chest2Opened1,
        assets.chest2Opened2,
        assets.chest2Opened3,
      ],
      chestOpened3: [
        assets.chest3Opened1,
        assets.chest3Opened2,
        assets.chest3Opened3,
      ],
      chestOpened4: [
        assets.chest4Opened1,
        assets.chest4Opened2,
        assets.chest4Opened3,
      ],
    };

    const pedestal = new Sprite(assets.pedestal);
    pedestal.anchor.set(0.5);
    pedestal.position.set(0, 100);
    pedestal.width = 460;
    pedestal.height = 420;
    this.container.addChild(pedestal);

    this.chest = new Chest(assets, onOpen);
    this.chest.setPosition(-8, -70);
    this.chest.sprite.width = 395;
    this.chest.sprite.height = 375;
    clickableContainer.addChild(this.chest.sprite);

    const label = new Sprite(assets.chestLabel);
    label.anchor.set(0.5);
    label.position.set(-35, 0);
    label.width = 180;
    label.height = 60;
    clickableContainer.addChild(label);

    this.labelText = new Text({
      text: 'OPEN',
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 20,
        fill: 0x300c02,
        fontWeight: 'bold',
      }),
    });
    this.labelText.anchor.set(0.5);
    this.labelText.position.set(-35, 0);
    clickableContainer.addChild(this.labelText);

    this.container.addChild(clickableContainer);
    clickableContainer.on('pointertap', () => {
      this.open(false);
    });
  }

  public reset() {
    this.chest.isOpened = false;
    this.chest.sprite.textures = [this.assets.chestClosed];
    this.labelText.text = 'OPEN';
    this.payout = 0;
    this.payoutPercentage = 0;
  }

  public open(isLast: boolean, payout?: number): void {
    if (this.chest.isOpened) return;
    sound.play('reveal', { volume: SFX_VOLUME });
    this.chest.isOpened = true;
    this.labelText.text =
      (payout?.toString() ?? this.payout.toString()) + ' ' + get(currency);

    this.animateLabelText();

    if (this.payoutPercentage <= 10) {
      this.chest.sprite.textures = this.chestTextures.chestOpened1;
    } else if (this.payoutPercentage <= 30) {
      this.chest.sprite.textures = this.chestTextures.chestOpened2;
    } else if (this.payoutPercentage <= 60) {
      this.chest.sprite.textures = this.chestTextures.chestOpened3;
    } else {
      this.chest.sprite.textures = this.chestTextures.chestOpened4;
    }
    this.chest.sprite.gotoAndPlay(0);
    this.chest.sprite.loop = false;
    this.chest.sprite.animationSpeed = 0.3;
    this.chest.sprite.play();

    this.onOpen({ payout: payout ?? this.payout, isLast });
  }

  private animateLabelText() {
    const originalScale = this.labelText.scale.x;
    const peakScale = originalScale * 1.25;

    const ticker = new Ticker();
    ticker.start();

    let elapsed = 0;
    const duration = 0.75; // total seconds (same as your 750ms)

    const update = (t: Ticker) => {
      elapsed += t.deltaMS / 1000;

      const progress = Math.min(elapsed / duration, 1);

      let scale: number;

      if (progress < 0.5) {
        // UP: 1 → 1.25
        const t = progress / 0.5;
        scale = originalScale + (peakScale - originalScale) * t;
      } else {
        // DOWN: 1.25 → 1
        const t = (progress - 0.5) / 0.5;
        scale = peakScale + (originalScale - peakScale) * t;
      }

      this.labelText.scale.set(scale);

      if (progress >= 1) {
        this.labelText.scale.set(originalScale);

        ticker.remove(update);
        ticker.stop();
        ticker.destroy();
      }
    };

    ticker.add(update);
  }
}
