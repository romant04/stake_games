import { Container, Sprite } from 'pixi.js';
import { CX, CY } from '../constants/layout';
import type { GameAssets } from '../../../../types/assets';

export class BonusHeadline {
  readonly container: Container;

  public constructor(private readonly assets: GameAssets) {
    this.container = new Container();

    const logo = new Sprite(assets.logo);
    logo.anchor.set(0.5);
    logo.position.set(CX, CY - 270);
    logo.width = 630;
    logo.height = 360;
    this.container.addChild(logo);

    const bonusHeadline = new Sprite(assets.bonusHeadline);
    bonusHeadline.anchor.set(0.5);
    bonusHeadline.position.set(CX + 10, CY - 100);
    bonusHeadline.width = 400;
    bonusHeadline.height = 120;
    this.container.addChild(bonusHeadline);

    this.container.visible = false;
  }
}
