import { Container, Sprite, type Texture } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { Layout } from '../constants/layout';

export class ToggleButton {
  readonly container: Container;

  public button: Container;
  public state: 'active' | 'inactive' = 'inactive';
  private readonly icon: Sprite;
  private readonly bg: Sprite;
  private lastTexture: Texture | null = null;

  public constructor(
    private readonly assets: GameAssets,
    private readonly iconTexture: Texture,
    private readonly activeIconTexture: Texture | null = null,
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
    this.icon.position.set(0, 0);

    this.button.addChild(this.bg, this.icon);
    this.container.addChild(this.button);

    this.button.on('pointerdown', () => {
      this.button.scale.set(0.95);
    });
    this.button.on('pointerup', () => {
      this.button.scale.set(1);
    });
    this.button.on('pointerover', () => {
      const newTexture =
        this.state === 'inactive'
          ? assets.toggleHover
          : this.state === 'active'
            ? assets.toggleActiveHover
            : this.bg.texture;

      this.lastTexture = this.bg.texture;
      if (newTexture !== this.bg.texture) {
        this.bg.texture = newTexture;
      }
    });
    this.button.on('pointerout', () => {
      this.bg.texture = this.lastTexture || this.bg.texture;
    });

    this.button.on('pointertap', () => {
      this.press();
    });
  }

  public press() {
    if (!this.action) {
      return;
    }

    this.action();

    if (this.state === 'active') {
      this.toggleInactive();
      this.state = 'inactive';
    } else if (this.state === 'inactive') {
      this.toggleActive();
      this.state = 'active';
    }
  }

  public disable() {
    this.button.eventMode = 'none';
    this.bg.texture = this.assets.toggleDisabled;
  }
  public enable() {
    this.button.eventMode = 'static';
    this.bg.texture =
      this.state === 'active' ? this.assets.toggleActive : this.assets.toggle;
  }

  public toggleActive() {
    this.state = 'active';
    this.bg.texture = this.assets.toggleActive;
    this.icon.texture = this.activeIconTexture || this.iconTexture;

    this.lastTexture = this.bg.texture;
  }
  public toggleInactive() {
    this.state = 'inactive';
    this.bg.texture = this.assets.toggle;
    this.icon.texture = this.iconTexture;

    this.lastTexture = this.bg.texture;
  }
}
