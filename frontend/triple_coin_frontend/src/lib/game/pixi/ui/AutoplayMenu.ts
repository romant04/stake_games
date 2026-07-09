import { Container, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import { BlurFilter } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { activeAutoplay, turboMode } from '../../../stores/game';
import { SmallButton } from './SmallButton';
import { Checkbox } from './Checkbox';
import { AutospinCountSelector } from './AutospinCountSelector';
import { startAutoplay } from '../../../../utils/startAutoplay';
import { Layout } from '../constants/layout';

export class AutoplayMenu {
  readonly container: Container;

  public dimBackground: Sprite;

  public constructor(
    private readonly assets: GameAssets,
    private readonly handleSpin: () => Promise<void>,
    private readonly reset: () => void,
    private readonly afterAutoplayCallback: () => void,
  ) {
    this.container = new Container();
    this.container.visible = false;

    // blurred background
    const overlay = new Container();

    const padding = 64;
    const blur = new BlurFilter({ strength: 25 });
    blur.padding = padding;

    overlay.filters = [blur];
    // Replace this.dimBackground = new Graphics() inside AutoplayMenu with:
    this.dimBackground = new Sprite(Texture.WHITE);
    this.dimBackground.tint = '#26140da6'; // Or color choice
    this.dimBackground.alpha = 0.65;
    this.dimBackground.eventMode = 'static';
    this.dimBackground.cursor = 'default';

    overlay.addChild(this.dimBackground);
    this.container.addChild(overlay);

    const menuContainer = new Container();
    menuContainer.position.set(Layout.CX, Layout.CY);
    this.container.addChild(menuContainer);

    const menuBackground = new Sprite(assets.autospinModalBg);
    menuBackground.anchor.set(0.5);
    menuBackground.width = 1000;
    menuBackground.height = 684;
    menuContainer.addChild(menuBackground);

    const headline = new Text({
      text: 'AUTOSPIN SETTINGS',
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 40,
        fill: 0xeec53a,
        fontWeight: 'bold',

        stroke: {
          color: 0x3c0e00,
          width: 5,
        },
      }),
    });
    headline.anchor.set(0.5);
    headline.position.set(0, -235);
    menuContainer.addChild(headline);

    const closeButton = new SmallButton(assets, assets.close, () => {
      this.hide();
    });
    closeButton.container.position.set(465, -215);
    menuContainer.addChild(closeButton.container);

    const turboSpinCheckbox = new Checkbox(assets, 'TURBO SPIN');
    turboSpinCheckbox.container.position.set(-280, -100);
    menuContainer.addChild(turboSpinCheckbox.container);

    const stopOnBonusCheckbox = new Checkbox(assets, 'STOP ON BONUS');
    stopOnBonusCheckbox.container.position.set(60, -100);
    menuContainer.addChild(stopOnBonusCheckbox.container);

    const numberOfAutospinsSelector = new AutospinCountSelector(assets);
    numberOfAutospinsSelector.container.position.set(0, 180);
    menuContainer.addChild(numberOfAutospinsSelector.container);

    const submitButton = new Sprite(assets.startAutospin);
    submitButton.anchor.set(0.5);
    submitButton.position.set(0, 230);
    submitButton.eventMode = 'static';
    submitButton.cursor = 'pointer';

    submitButton.on('pointerover', () => {
      submitButton.texture = assets.startAutospinHover;
    });
    submitButton.on('pointerout', () => {
      submitButton.texture = assets.startAutospin;
    });
    submitButton.on('pointerdown', () => {
      submitButton.scale.set(0.95);
    });
    submitButton.on('pointerup', () => {
      submitButton.scale.set(1);
    });
    submitButton.on('pointertap', () => {
      const selectedAutospins = numberOfAutospinsSelector.selectedOption;
      const isTurboSpinEnabled = turboSpinCheckbox.checked;
      const isAutoSpinBonusEnabled = stopOnBonusCheckbox.checked!;

      activeAutoplay.set({
        spins: selectedAutospins,
        turboSpins: isTurboSpinEnabled,
        autoplayBonus: isAutoSpinBonusEnabled,
      });
      if (isTurboSpinEnabled) {
        turboMode.set(true);
      }
      void startAutoplay(handleSpin, reset);
      this.hide();
      this.afterAutoplayCallback();
    });
    menuContainer.addChild(submitButton);
  }

  public hide() {
    this.container.visible = false;
  }
  public show() {
    this.container.visible = true;
  }
}
