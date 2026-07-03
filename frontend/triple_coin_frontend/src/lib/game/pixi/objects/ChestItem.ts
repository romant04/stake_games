import { Container, Sprite, Text, TextStyle } from 'pixi.js';
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

  public constructor(
    private readonly assets: GameAssets,
    private readonly onOpen: (event: ChestOpenEvent) => void,
  ) {
    this.container = new Container();
    this.container.eventMode = 'static'; // TODO: This should not include the pedestal
    this.container.cursor = 'pointer';

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
    this.container.addChild(this.chest.sprite);

    const label = new Sprite(assets.chestLabel);
    label.anchor.set(0.5);
    label.position.set(-35, 0);
    label.width = 180;
    label.height = 60;
    this.container.addChild(label);

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
    this.container.addChild(this.labelText);

    this.container.on('pointertap', () => {
      this.open(false);
    });
  }

  public reset() {
    this.chest.isOpened = false;
    this.chest.sprite.texture = this.assets.chestClosed;
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
      this.chest.sprite.texture = this.assets.chestOpened1;
    } else if (this.payoutPercentage <= 30) {
      this.chest.sprite.texture = this.assets.chestOpened2;
    } else if (this.payoutPercentage <= 60) {
      this.chest.sprite.texture = this.assets.chestOpened3;
    } else {
      this.chest.sprite.texture = this.assets.chestOpened4;
    }

    this.onOpen({ payout: payout ?? this.payout, isLast });
  }
}
