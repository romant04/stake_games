import { Container, Sprite, Text, TextStyle, type Texture } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { Chest, type ChestOpenEvent } from './Chest';
import { get } from 'svelte/store';
import { currency } from '../../../stores/game';

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

  public constructor(
    private readonly assets: GameAssets,
    private readonly onOpen: (event: ChestOpenEvent) => void,
  ) {
    this.container = new Container();

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
    this.chest.isOpened = true;
    this.labelText.text =
      (payout?.toString() ?? this.payout.toString()) + ' ' + get(currency);

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
}
