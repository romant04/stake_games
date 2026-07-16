import { Container, type Ticker } from 'pixi.js';
import { SmallButton } from './SmallButton';
import { isGameInfoOpen } from '../../../stores/game';
import { get } from 'svelte/store';
import type { GameAssets } from '../../../../types/assets';
import { MuteButton } from './MuteButton';
import { animateAlpha, animateScale, animateY } from '../../utils/animateXandY';

export class BurgerMenu {
  public readonly container: Container;
  private isOpen: boolean = false;

  private readonly menuItems: (SmallButton | MuteButton)[] = [];

  public constructor(
    private readonly assets: GameAssets,
    private readonly ticker: Ticker,
  ) {
    this.container = new Container();

    const muteBtn = new MuteButton(assets);
    muteBtn.container.visible = false;
    this.container.addChild(muteBtn.container);

    const infoBtn = new SmallButton(assets, assets.info, () => {
      isGameInfoOpen.set(!get(isGameInfoOpen));
    });
    infoBtn.container.scale = 0.75;
    infoBtn.container.visible = false;
    this.container.addChild(infoBtn.container);

    this.menuItems.push(infoBtn);
    this.menuItems.push(muteBtn);

    const burger = new SmallButton(assets, assets.hamburger, () => {
      this.isOpen = !this.isOpen;
      this.showItems();

      if (this.isOpen) {
        burger.icon.texture = assets.close;
      } else {
        burger.icon.texture = assets.hamburger;
      }
    });
    this.container.addChild(burger.container);
  }

  private async showItems() {
    const animations = this.menuItems.map((item, index) => {
      const targetY = -75 - 65 * index;

      if (this.isOpen) {
        item.container.visible = true;
        item.container.y = 0;
        item.container.alpha = 0;
        item.container.scale.set(0);

        return Promise.all([
          animateY(this.ticker, item.container, targetY, 350 + index * 50),
          animateAlpha(this.ticker, item.container, 1, 250),
          animateScale(this.ticker, item.container, 0.75, 350 + index * 50),
        ]);
      }

      return Promise.all([
        animateY(this.ticker, item.container, 0, 200),
        animateAlpha(this.ticker, item.container, 0, 150),
        animateScale(this.ticker, item.container, 0, 200),
      ]).then(() => {
        item.container.visible = false;
      });
    });

    await Promise.all(animations);
  }
}
