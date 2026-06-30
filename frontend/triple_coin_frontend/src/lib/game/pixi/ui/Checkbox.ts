import { Container, Sprite, Text, TextStyle } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';

export class Checkbox {
  readonly container: Container;

  public checked: boolean = false;

  public constructor(
    private readonly assets: GameAssets,
    private readonly labelText: string,
  ) {
    this.container = new Container();
    this.container.eventMode = 'static';
    this.container.cursor = 'pointer';

    const checkbox = new Sprite(assets.checkbox);
    checkbox.anchor.set(0.5);
    checkbox.width = 60;
    checkbox.height = 60;
    this.container.addChild(checkbox);

    const label = new Text({
      text: labelText,
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 28,
        fill: 0xece7c4,
        fontWeight: 'bold',

        stroke: {
          color: 0x3c0e00,
          width: 2,
        },
      }),
    });
    label.anchor.set(0, 0.5);
    label.position.set(40, 0);
    this.container.addChild(label);

    this.container.on('pointerover', () => {
      if (!this.checked) {
        checkbox.texture = assets.checkboxHover;
      } else {
        checkbox.texture = assets.checkboxActiveHover;
      }
    });
    this.container.on('pointerout', () => {
      if (!this.checked) {
        checkbox.texture = assets.checkbox;
      } else {
        checkbox.texture = assets.checkboxActive;
      }
    });
    this.container.on('pointerdown', () => {
      checkbox.scale.set(0.95);
      label.scale.set(0.95);
    });
    this.container.on('pointerup', () => {
      checkbox.scale.set(1);
      label.scale.set(1);
    });
    this.container.on('pointertap', () => {
      this.checked = !this.checked;
      if (this.checked) {
        checkbox.texture = assets.checkboxActive;
      } else {
        checkbox.texture = assets.checkbox;
      }
    });
  }
}
