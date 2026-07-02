import { Container, Sprite } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { GameHistory } from '../ui/GameHistory';
import { SpinButton } from '../ui/SpinButton';
import { ToggleButton } from '../ui/ToggleButton';
import {
  autoplayShouldStop,
  isGameInfoOpen,
  turboMode,
} from '../../../stores/game';
import { get } from 'svelte/store';
import { BalanceText } from '../ui/BalanceText';
import { BetAmountSelector } from '../ui/BetAmountSelector';
import { SmallButton } from '../ui/SmallButton';
import { AutospinButton } from '../ui/AutospinButton';
import { LastWin } from '../ui/LastWin';
import { BonusHeadline } from '../ui/BonusHeadline';
import { Layout } from '../constants/layout';

export class UIManager {
  readonly container: Container;
  public readonly gameHistory: GameHistory;
  public readonly spinButton: SpinButton;

  public readonly turboModeButton: ToggleButton;
  public readonly balance: BalanceText;
  public readonly lastWin: LastWin;
  public readonly fog: Sprite;
  private readonly autospinButton: AutospinButton;
  private readonly stopAutospinButton: AutospinButton;
  private readonly bonusHeadline: BonusHeadline;

  constructor(
    private readonly assets: GameAssets,
    private readonly handleSpin: () => Promise<void>,
    private readonly handleReplay: () => Promise<void>,
    private readonly showAutoplayMenu: () => void,
  ) {
    this.container = new Container();

    this.fog = new Sprite(assets.fog);
    this.fog.visible = false;
    this.container.addChild(this.fog);

    this.balance = new BalanceText();
    this.balance.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.132,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.container.addChild(this.balance.container);
    this.lastWin = new LastWin();
    this.lastWin.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.85,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.container.addChild(this.lastWin.container);

    const burgerMenu = new SmallButton(
      assets,
      { x: Layout.VIRTUAL_WIDTH * 0.045, y: Layout.VIRTUAL_HEIGHT * 0.9 },
      assets.hamburger,
      () => {
        isGameInfoOpen.set(!get(isGameInfoOpen));
      },
    );
    this.container.addChild(burgerMenu.container);

    const balanceSelector = new BetAmountSelector(assets);
    balanceSelector.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.285,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.container.addChild(balanceSelector.container);

    this.autospinButton = new AutospinButton(
      assets,
      { x: Layout.VIRTUAL_WIDTH * 0.7, y: Layout.VIRTUAL_HEIGHT * 0.9 },
      assets.hamburger,
      'AUTOSPIN',
      () => {
        this.showAutoplayMenu();
      },
    );
    this.container.addChild(this.autospinButton.container);
    this.stopAutospinButton = new AutospinButton(
      assets,
      { x: Layout.VIRTUAL_WIDTH * 0.7, y: Layout.VIRTUAL_HEIGHT * 0.9 },
      assets.close,
      'STOP AUTOSPIN',
      () => {
        autoplayShouldStop.set(true);
        this.changeAutoplayButtonState(false);
      },
    );
    this.stopAutospinButton.container.visible = false;
    this.container.addChild(this.stopAutospinButton.container);

    this.spinButton = new SpinButton(assets, handleSpin, handleReplay);
    this.spinButton.container.position.set(0, Layout.VIRTUAL_HEIGHT * 0.9);
    this.container.addChild(this.spinButton.container);
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'Space' || e.repeat) return;

      e.preventDefault();

      this.spinButton.button.scale.set(0.95);
      this.spinButton.press();
    });
    window.addEventListener('keyup', (e) => {
      if (e.code !== 'Space') return;

      this.spinButton.button.scale.set(1);
    });

    this.turboModeButton = new ToggleButton(
      assets,
      { x: Layout.VIRTUAL_WIDTH * 0.95, y: Layout.VIRTUAL_HEIGHT * 0.9 },
      assets.bolt,
      assets.boltFilled,
      () => {
        turboMode.set(!get(turboMode));
      },
    );
    this.container.addChild(this.turboModeButton.container);

    this.gameHistory = new GameHistory(assets);
    this.gameHistory.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.9,
      Layout.VIRTUAL_HEIGHT * 0.05,
    );
    this.container.addChild(this.gameHistory.container);

    // BONUS GAME UI
    this.bonusHeadline = new BonusHeadline(assets);
    this.container.addChild(this.bonusHeadline.container);
  }

  public changeAutoplayButtonState(isAutoplayActive: boolean) {
    if (isAutoplayActive) {
      this.autospinButton.container.visible = false;
      this.stopAutospinButton.container.visible = true;
    } else {
      this.autospinButton.container.visible = true;
      this.stopAutospinButton.container.visible = false;
    }
  }

  public showBonusGameUI() {
    this.bonusHeadline.container.visible = true;
    this.fog.visible = true;
  }
  public hideBonusGameUI() {
    this.bonusHeadline.container.visible = false;
    this.fog.visible = false;
  }

  public updateSpinButtonText(isBonus: boolean) {
    if (isBonus) {
      this.spinButton.text.texture = this.assets.openAll;
    } else {
      this.spinButton.text.texture = this.assets.spinText;
    }
  }
}
