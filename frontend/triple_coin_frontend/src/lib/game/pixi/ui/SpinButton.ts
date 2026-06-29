import { Container, Sprite } from 'pixi.js';
import { CX, VIRTUAL_HEIGHT } from '../constants/layout';
import type { GameAssets } from '../../../../types/assets';

export class SpinButton {
  readonly container: Container;

  public button: Container;
  private readonly bg: Sprite;

  public constructor(
    private readonly assets: GameAssets,
    private readonly handleSpin: () => void,
  ) {
    this.container = new Container();

    this.button = new Container();
    this.button.position.set(CX, 0);
    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';

    this.bg = new Sprite(assets.spin);
    this.bg.anchor.set(0.5);
    this.bg.width = 400;
    this.bg.height = 160;

    const text = new Sprite(assets.spinText);
    text.anchor.set(0.5);
    text.position.set(0, 5);

    this.button.addChild(this.bg, text);
    this.container.addChild(this.button);

    this.button.on('pointerdown', () => {
      this.button.scale.set(0.95);
    });
    this.button.on('pointerup', () => {
      this.button.scale.set(1);
    });
    this.button.on('pointerover', () => {
      this.bg.texture = assets.spinHover;
    });
    this.button.on('pointerout', () => {
      this.bg.texture = assets.spin;
    });

    this.button.on('pointertap', () => {
      this.press();
    });
  }

  public press() {
    this.handleSpin();
  }

  public disable() {
    this.button.eventMode = 'none';
    this.bg.texture = this.assets.spinDisabled;
  }
  public enable() {
    this.button.eventMode = 'static';
    this.bg.texture = this.assets.spin;
  }
}
