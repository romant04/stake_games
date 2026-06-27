import { Container, Sprite } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { CX, CY, VIRTUAL_WIDTH } from '../constants/layout';

export class UIManager {
  readonly container: Container;

  constructor(private readonly assets: GameAssets) {
    this.container = new Container();

    const winTable = new Sprite(assets.winTable);
    winTable.anchor.set(0.5);
    winTable.position.set(VIRTUAL_WIDTH * 0.18, CY + 20);
    winTable.width = 600;
    winTable.height = 850;
    this.container.addChild(winTable);
  }
}
