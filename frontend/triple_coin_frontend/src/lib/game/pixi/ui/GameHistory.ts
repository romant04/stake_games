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
      sprite.position.set(index * 65, 0);
      sprite.width = value === 'S' ? 8 : 60;
      sprite.height = 60;
      sprite.alpha = this.opacity;
      this.container.addChild(sprite);
    });
  }
}

export class GameHistory {
  readonly container: Container;

  private readonly records: HistoryRecord[] = [];
  private lastOrientation: 'landscape' | 'portrait' = 'landscape';

  constructor(private readonly assets: GameAssets) {
    this.container = new Container();

    this.updateHistory();
  }

  public update() {
    this.updateHistory();
  }

  public rerenderRecords(orientation: 'landscape' | 'portrait') {
    this.container.removeChildren();
    this.records.forEach((record, index) => {
      if (orientation === 'portrait') {
        record.container.position.set(index * 225, 0);
      } else {
        record.container.position.set(0, index * 80);
      }
      this.container.addChild(record.container);
    });

    this.lastOrientation = orientation;
  }
  // TODO: Solve swapping to portrait and landscape
  private updateHistory() {
    this.container.removeChildren();
    this.records.length = 0;

    const games = get(gameHistory).slice(-MAX_HISTORY);

    games.forEach((game, index) => {
      const values = game.split('');
      const opacityValue = wasWin(values) ? 1 : 0.5;

      const record = new HistoryRecord(values, this.assets, opacityValue);

      if (this.lastOrientation === 'portrait') {
        record.container.position.set(index * 225, 0);
      } else {
        record.container.position.set(0, index * 80);
      }

      this.container.addChild(record.container);
      this.records.push(record);
    });
  }
}
