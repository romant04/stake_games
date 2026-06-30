import { Container, Sprite } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { get } from 'svelte/store';
import { gameHistory } from '../../../stores/game';
import { MAX_HISTORY } from '../constants/game';
import { wasWin } from '../../../../utils/wasWin';

class HistoryRecord {
  readonly container: Container;
  constructor(
    private readonly results: string[],
    private readonly assets: GameAssets,
    private readonly opacity: number,
  ) {
    this.container = new Container();
    this.results.forEach((value, index) => {
      const texture =
        value === 'H'
          ? assets.front
          : value === 'T'
            ? assets.back
            : assets.side;
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.position.set(index * 70, 0);
      sprite.width = value === 'S' ? 8 : 60;
      sprite.height = 60;
      sprite.alpha = this.opacity;
      this.container.addChild(sprite);
    });
  }
}

export class GameHistory {
  readonly container: Container;

  constructor(private readonly assets: GameAssets) {
    this.container = new Container();

    get(gameHistory)
      .slice(-MAX_HISTORY)
      .forEach((game) => {
        const values = game.split('');
        const opacityValue = wasWin(values) ? 1 : 0.5;

        const record = new HistoryRecord(values, assets, opacityValue);
        record.container.position.set(0, this.container.children.length * 80);
      });
  }

  public update() {
    this.container.removeChildren();

    get(gameHistory)
      .slice(-MAX_HISTORY)
      .forEach((game) => {
        const values = game.split('');
        const opacityValue = wasWin(values) ? 1 : 0.5;

        const record = new HistoryRecord(values, this.assets, opacityValue);
        record.container.position.set(0, this.container.children.length * 80);
        this.container.addChild(record.container);
      });
  }
}
