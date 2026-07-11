import { Container, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import { BlurFilter } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import type { Unsubscriber } from 'svelte/store';
import { isGameInfoOpen } from '../../../stores/game';
import { Layout } from '../constants/layout';
import { Button } from './Button';

class CoinGroup {
  public readonly container: Container;

  public constructor(
    private readonly assets: GameAssets,
    private readonly coins: ('T' | 'H' | 'S')[],
    private readonly pay: string,
  ) {
    this.container = new Container();

    const coinSpacing = -30;
    const coinSize = 64;

    const totalWidth =
      this.coins.length * coinSize + (this.coins.length - 1) * coinSpacing;
    let startX = 0 - totalWidth / 2 + coinSize / 2;

    for (const coinType of this.coins) {
      const texture =
        coinType === 'T'
          ? assets.empty
          : coinType === 'H'
            ? assets.front
            : assets.side;

      const coinSprite = new Sprite(texture);
      coinSprite.anchor.set(0.5);
      coinSprite.width = coinType === 'S' ? 8 : coinSize;
      coinSprite.height = coinSize;
      coinSprite.position.set(startX, 0);

      this.container.addChild(coinSprite);

      startX += coinSize + coinSpacing;
    }

    const payout = new Text({
      text: pay,
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 44,
        fill: 0xeec53a,
        fontWeight: 'bold',

        stroke: {
          color: 0x531300,
          width: 5,
        },
      }),
    });
    payout.anchor.set(1, 0.5);
    payout.position.set(700, 0);
    this.container.addChild(payout);
  }
}

export class InfoOverlay {
  readonly container: Container;

  public dimBackground: Sprite;

  private readonly unsubscribe: Unsubscriber;

  private readonly logo: Container;
  private readonly rtpText: Text;
  private readonly infoText: Text;
  private readonly payouts: Container;

  private readonly btn: Button;

  public constructor(private readonly assets: GameAssets) {
    this.container = new Container();
    this.container.visible = false;

    this.unsubscribe = isGameInfoOpen.subscribe((isOpen) => {
      console.log(`InfoOverlay: isGameInfoOpen changed to ${isOpen}`);
      if (isOpen) {
        this.show();
      } else {
        this.hide();
      }
    });

    // blurred background
    const overlay = new Container();

    const padding = 64;
    const blur = new BlurFilter({ strength: 25 });
    blur.padding = padding;

    overlay.filters = [blur];
    // Replace this.dimBackground = new Graphics() inside AutoplayMenu with:
    this.dimBackground = new Sprite(Texture.WHITE);
    this.dimBackground.tint = '#26140da6'; // Or color choice
    this.dimBackground.alpha = 0.75;
    this.dimBackground.eventMode = 'static';
    this.dimBackground.cursor = 'default';

    overlay.addChild(this.dimBackground);
    this.container.addChild(overlay);

    this.logo = new Container();
    this.logo.position.set(Layout.CX, 230);

    const logoImg = new Sprite(assets.logo);
    logoImg.anchor.set(0.5);
    logoImg.height = 370;
    logoImg.width = 650;
    this.logo.addChild(logoImg);
    this.container.addChild(this.logo);
    const gameRulesText = new Sprite(assets.gameRules);
    gameRulesText.anchor.set(0.5);
    gameRulesText.position.set(10, 180);
    gameRulesText.width = 380;
    gameRulesText.height = 125;
    this.logo.addChild(gameRulesText);

    this.rtpText = new Text({
      text: 'RTP 96.46%',
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 44,
        fill: 0xeec53a,
        fontWeight: 'bold',

        stroke: {
          color: 0x531300,
          width: 5,
        },
      }),
    });
    this.rtpText.anchor.set(0);
    this.rtpText.position.set(Layout.CX + 88, 480);
    this.container.addChild(this.rtpText);

    this.infoText = new Text({
      text:
        'Malfunction voids all wins and plays. A consistent internet connection\n' +
        'is required. In the event of a disconnection, reload the game to finish\n' +
        'any uncompleted rounds. The expected return is calculated over many\n' +
        'plays. The game display is not representative of any physical device and\n' +
        'is for illustrative purposes only. Winnings are settled according to the\n' +
        'amount received from the Remote Game Server and not from events within\n' +
        'the web browser. TM and © 2026 Stake Engine',
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 22,
        fill: 0xece7c4,
        wordWrap: true,
        wordWrapWidth: 800,
        align: 'justify',
      }),
    });
    this.infoText.anchor.set(0);
    this.infoText.position.set(Layout.CX + 90, 540);
    this.container.addChild(this.infoText);

    this.btn = new Button(assets, 'CLOSE', () => {
      isGameInfoOpen.set(false);
    });
    this.btn.container.position.set(Layout.CX, 980);
    this.container.addChild(this.btn.container);

    this.payouts = new Container();
    this.payouts.position.set(200, 520);
    this.container.addChild(this.payouts);

    const one = new CoinGroup(assets, ['T', 'T', 'H'], '0.5x');
    one.container.position.set(0, 0);
    this.payouts.addChild(one.container);

    const two = new CoinGroup(assets, ['T', 'H', 'H'], '2x');
    two.container.position.set(0, 80);
    this.payouts.addChild(two.container);

    const three = new CoinGroup(assets, ['H', 'H', 'H'], '4x');
    three.container.position.set(0, 160);
    this.payouts.addChild(three.container);

    const s = new CoinGroup(assets, ['S', 'S', 'S'], '10-500x');
    s.container.position.set(0, 240);
    this.payouts.addChild(s.container);
  }

  public hide() {
    this.container.visible = false;
  }
  public show() {
    this.container.visible = true;
  }

  public destroy() {
    this.unsubscribe();
    this.container.destroy({ children: true });
  }

  public onOrientationChange(orientation: 'landscape' | 'portrait') {
    if (orientation === 'portrait') {
      this.rerenderToPortrait();
    } else {
      this.rerenderToLandscape();
    }
  }

  private rerenderToPortrait() {
    this.payouts.position.set(200, 750);
    this.logo.position.set(Layout.CX, 300);
    this.logo.height = 500;
    this.logo.width = 800;

    this.rtpText.position.set(420, 1200);
    this.infoText.anchor.set(0.5, 0);
    this.infoText.position.set(Layout.CX, 1300);
    this.infoText.style.align = 'center';
    this.infoText.style.fontSize = 24;
    this.infoText.style.wordWrapWidth = 900;

    this.btn.container.position.set(Layout.CX, Layout.CY * 2 - 100);
  }

  private rerenderToLandscape() {
    this.logo.position.set(Layout.CX, 230);
    this.logo.height = 370;
    this.logo.width = 650;

    this.infoText.style.align = 'justify';
    this.infoText.style.fontSize = 22;
    this.infoText.style.wordWrapWidth = 800;
    this.infoText.anchor.set(0);
    this.infoText.position.set(Layout.CX + 90, 540);

    this.rtpText.position.set(Layout.CX + 88, 480);
    this.payouts.position.set(200, 520);
    this.btn.container.position.set(Layout.CX, 980);
  }
}
