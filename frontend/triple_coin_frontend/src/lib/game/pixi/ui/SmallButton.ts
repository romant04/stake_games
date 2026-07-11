import { Container, Sprite, type Texture } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { Layout } from '../constants/layout';
import { sound } from '@pixi/sound';
import { SFX_VOLUME } from '../constants/game';

export class SmallButton {
  readonly container: Container;

  public button: Container;
  private readonly icon: Sprite;
  private readonly bg: Sprite;

  public constructor(
    private readonly assets: GameAssets,
    private readonly iconTexture: Texture,
    private readonly action: (() => void) | null = null,
  ) {
    this.container = new Container();

    this.button = new Container();
    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';

    this.bg = new Sprite(assets.toggle);
    this.bg.anchor.set(0.5);
    this.bg.width = 115;
    this.bg.height = 115;

    this.icon = new Sprite(iconTexture);
    this.icon.anchor.set(0.5);
    this.icon.width = 40;
    this.icon.height = 40;
    this.icon.position.set(0, -1);

    this.button.addChild(this.bg, this.icon);
    this.container.addChild(this.button);

    this.button.on('pointerdown', () => {
      this.button.scale.set(0.95);
    });
    this.button.on('pointerup', () => {
      this.button.scale.set(1);
    });
    this.button.on('pointerover', () => {
      this.bg.texture = assets.toggleHover;
    });
    this.button.on('pointerout', () => {
      this.bg.texture = assets.toggle;
    });

    this.button.on('pointertap', () => {
      this.press();
    });
  }

  public press() {
    if (!this.action) {
      return;
    }

    sound.play('click', { volume: SFX_VOLUME });
    this.action();
  }

  public disable() {
    this.button.eventMode = 'none';
    this.bg.texture = this.assets.toggleDisabled;
  }
  public enable() {
    this.button.eventMode = 'static';
    this.bg.texture = this.assets.toggle;
  }
}
