import { Container, Sprite } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { Layout } from '../constants/layout';

export class BonusHeadline {
  readonly container: Container;

  public constructor(private readonly assets: GameAssets) {
    this.container = new Container();

    const logo = new Sprite(assets.logo);
    logo.anchor.set(0.5);
    logo.position.set(Layout.CX, Layout.CY - 270);
    logo.width = 630;
    logo.height = 360;
    this.container.addChild(logo);

    const bonusHeadline = new Sprite(assets.bonusHeadline);
    bonusHeadline.anchor.set(0.5);
    bonusHeadline.position.set(Layout.CX + 10, Layout.CY - 100);
    bonusHeadline.width = 400;
    bonusHeadline.height = 120;
    this.container.addChild(bonusHeadline);

    this.container.visible = false;
  }
}
