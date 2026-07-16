import { Container } from 'pixi.js';
import { SmallButton } from './SmallButton';
import type { GameAssets } from '../../../../types/assets';
import { sound } from '@pixi/sound';

export class MuteButton {
  public readonly container: Container;
  private muted: boolean = false;

  public constructor(private readonly assets: GameAssets) {
    this.container = new Container();

    const muteButton = new SmallButton(assets, assets.sound, () => {
      if (this.muted) {
        sound.unmuteAll();
        this.muted = false;
      } else {
        sound.muteAll();
        this.muted = true;
      }
      muteButton.icon.texture = this.muted ? assets.mute : assets.sound;
    });
    this.container.scale = 0.75;
    this.container.addChild(muteButton.container);
  }
}
