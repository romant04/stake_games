import { Container, Sprite, Text, TextStyle } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';

export class SelectionButton {
  readonly container: Container;
  public selected: boolean = false;
  public value: number = 0;
  private readonly bg: Sprite;

  public constructor(
    private readonly assets: GameAssets,
    value: number,
    private readonly onSelect: (value: number) => void,
  ) {
    this.container = new Container();
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';
    this.value = value;

    this.bg = new Sprite(assets.selectionButton);
    this.bg.anchor.set(0.5);
    this.bg.width = 138;
    this.bg.height = 72;
    this.container.addChild(this.bg);

    const label = new Text({
      text: value.toString(),
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 28,
        fill: 0xece7c4,
        fontWeight: 'bold',

        stroke: {
          color: 0xc4672a,
          width: 2,
        },
      }),
    });
    label.anchor.set(0.5);
    label.position.set(0, -2);
    this.container.addChild(label);

    this.container.on('pointerover', () => {
      if (!this.selected) {
        this.bg.texture = assets.selectionButtonHover;
      } else {
        this.bg.texture = assets.selectionButtonActiveHover;
      }
    });
    this.container.on('pointerout', () => {
      if (!this.selected) {
        this.bg.texture = assets.selectionButton;
      } else {
        this.bg.texture = assets.selectionButtonActive;
      }
    });
    this.container.on('pointerdown', () => {
      this.container.scale.set(0.95);
    });
    this.container.on('pointerup', () => {
      this.container.scale.set(1);
    });
    this.container.on('pointertap', () => {
      this.onSelect(value);
    });
  }

  public update(): void {
    if (this.selected) {
      this.bg.texture = this.assets.selectionButtonActive;
    } else {
      this.bg.texture = this.assets.selectionButton;
    }
  }
}
