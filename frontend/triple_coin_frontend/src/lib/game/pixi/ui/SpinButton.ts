import { Container, Sprite } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { replayMode } from '../../../stores/game';
import { get } from 'svelte/store';
import { Layout } from '../constants/layout';

export class SpinButton {
  readonly container: Container;

  public button: Container;
  public readonly text: Sprite;
  private readonly bg: Sprite;

  public constructor(
    private readonly assets: GameAssets,
    private readonly handleSpin: () => Promise<void>,
    private readonly handleReplay: () => Promise<void>,
  ) {
    this.container = new Container();

    this.button = new Container();
    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';

    this.bg = new Sprite(assets.spin);
    this.bg.anchor.set(0.5);
    this.bg.width = 400;
    this.bg.height = 160;

    this.text = new Sprite(assets.spinText);
    this.text.anchor.set(0.5);
    this.text.position.set(0, 5);

    this.button.addChild(this.bg, this.text);
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
    if (get(replayMode)) {
      void this.handleReplay();
    } else {
      void this.handleSpin();
    }
  }

  public disable() {
    this.button.eventMode = 'none';
    this.bg.texture = this.assets.spinDisabled;
    this.text.alpha = 0.5;
  }
  public enable() {
    this.button.eventMode = 'static';
    this.bg.texture = this.assets.spin;
    this.text.alpha = 1;
  }
}
