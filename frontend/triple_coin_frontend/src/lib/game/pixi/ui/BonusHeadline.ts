import { Container, Sprite } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { Layout } from '../constants/layout';

export class BonusHeadline {
  readonly container: Container;

  private readonly logo: Sprite;
  private readonly bonusHeadline: Sprite;

  public constructor(private readonly assets: GameAssets) {
    this.container = new Container();

    this.logo = new Sprite(assets.logo);
    this.logo.anchor.set(0.5);
    this.logo.position.set(Layout.CX, Layout.CY - 270);
    this.logo.width = 630;
    this.logo.height = 360;
    this.container.addChild(this.logo);

    this.bonusHeadline = new Sprite(assets.bonusHeadline);
    this.bonusHeadline.anchor.set(0.5);
    this.bonusHeadline.position.set(Layout.CX + 10, Layout.CY - 100);
    this.bonusHeadline.width = 400;
    this.bonusHeadline.height = 120;
    this.container.addChild(this.bonusHeadline);

    this.container.visible = false;
  }

  public rerenderToPortrait() {
    this.logo.position.set(Layout.CX, 375);
    this.bonusHeadline.position.set(Layout.CX + 10, 545);
  }
  public rerenderToLandscape() {
    this.logo.position.set(Layout.CX, Layout.CY - 270);
    this.bonusHeadline.position.set(Layout.CX + 10, Layout.CY - 100);
  }
}
