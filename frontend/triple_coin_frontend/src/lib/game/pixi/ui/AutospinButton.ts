import { Container, Sprite, Text, TextStyle, type Texture } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { Layout } from '../constants/layout';

export class AutospinButton {
  readonly container: Container;

  public button: Container;
  private readonly text: Text;
  private readonly icon: Sprite;
  private readonly bg: Sprite;

  public constructor(
    private readonly assets: GameAssets,
    private readonly iconTexture: Texture,
    private readonly label: string,
    private readonly action: (() => void) | null = null,
  ) {
    this.container = new Container();

    this.button = new Container();
    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';

    this.bg = new Sprite(assets.button);
    this.bg.anchor.set(0.5);
    this.bg.width = 300;
    this.bg.height = 80;

    const textIconContainer = new Container();
    textIconContainer.position.set(0, 0);

    this.icon = new Sprite(iconTexture);
    this.icon.anchor.set(0.5);
    this.icon.width = 40;
    this.icon.height = 40;

    this.text = new Text({
      text: label,
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 24,
        fill: 0xece7c4,
        fontWeight: 'bold',
      }),
    });
    this.text.anchor.set(0, 0.5); // left-aligned, vertically centered

    // --- Center the icon+text group as a whole ---
    const gap = 12; // space between icon and text
    const totalWidth = this.icon.width + gap + this.text.width;
    const leftEdge = -totalWidth / 2;

    this.icon.position.set(leftEdge + this.icon.width / 2, 0);
    this.text.position.set(leftEdge + this.icon.width + gap, 0);

    textIconContainer.addChild(this.icon, this.text);
    this.button.addChild(this.bg, textIconContainer);
    this.container.addChild(this.button);

    this.button.on('pointerdown', () => {
      this.button.scale.set(0.95);
    });
    this.button.on('pointerup', () => {
      this.button.scale.set(1);
    });
    this.button.on('pointerover', () => {
      this.bg.texture = assets.buttonHover;
    });
    this.button.on('pointerout', () => {
      this.bg.texture = assets.button;
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
