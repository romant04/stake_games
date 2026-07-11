import { Container, Sprite, Text, TextStyle } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { sound } from '@pixi/sound';
import { SFX_VOLUME } from '../constants/game';

export class Button {
  public readonly container: Container;

  private readonly button: Container;
  private readonly bg: Sprite;
  public constructor(
    private readonly assets: GameAssets,
    private readonly label: string,
    private readonly press: () => void,
  ) {
    this.container = new Container();

    this.button = new Container();
    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';

    this.bg = new Sprite(assets.button);
    this.bg.anchor.set(0.5);
    this.bg.position.set(0, 0);
    this.bg.height = 80;
    this.bg.width = 300;
    this.button.addChild(this.bg);
    const btnText = new Text({
      text: label,
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 24,
        fill: 0xece7c4,
        fontWeight: 'bold',
      }),
    });
    btnText.anchor.set(0.5);
    btnText.position.set(0, -1);
    this.button.addChild(btnText);
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
      sound.play('click', { volume: SFX_VOLUME });
      this.press();
    });
  }
}
