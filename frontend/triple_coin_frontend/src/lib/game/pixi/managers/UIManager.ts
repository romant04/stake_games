import { Container, type Ticker } from 'pixi.js';
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
import { AutospinButton } from '../ui/AutospinButton';
import { LastWin } from '../ui/LastWin';
import { BonusHeadline } from '../ui/BonusHeadline';
import { Layout } from '../constants/layout';
import { BurgerMenu } from '../ui/BurgerMenu';

export class UIManager {
  readonly container: Container;
  public readonly gameHistory: GameHistory;
  public readonly spinButton: SpinButton;

  public readonly turboModeButton: ToggleButton;
  public readonly balance: BalanceText;
  public readonly lastWin: LastWin;
  private readonly autospinButton: AutospinButton;
  private readonly stopAutospinButton: AutospinButton;
  private readonly bonusHeadline: BonusHeadline;
  private readonly burgerMenu: BurgerMenu;
  private readonly betSelector: BetAmountSelector;

  constructor(
    private readonly assets: GameAssets,
    private readonly ticker: Ticker,
    private readonly handleSpin: () => Promise<void>,
    private readonly handleReplay: () => Promise<void>,
    private readonly showAutoplayMenu: () => void,
  ) {
    this.container = new Container();

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

    this.burgerMenu = new BurgerMenu(assets, this.ticker);
    this.burgerMenu.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.045,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.container.addChild(this.burgerMenu.container);

    this.betSelector = new BetAmountSelector(assets);
    this.betSelector.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.285,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.container.addChild(this.betSelector.container);

    this.autospinButton = new AutospinButton(
      assets,
      assets.autospin,
      'AUTOSPIN',
      () => {
        this.showAutoplayMenu();
      },
    );
    this.autospinButton.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.7,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.container.addChild(this.autospinButton.container);
    this.stopAutospinButton = new AutospinButton(
      assets,
      assets.pause,
      'STOP AUTOSPIN',
      () => {
        autoplayShouldStop.set(true);
        this.changeAutoplayButtonState(false);
      },
    );
    this.stopAutospinButton.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.7,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.stopAutospinButton.container.visible = false;
    this.container.addChild(this.stopAutospinButton.container);

    this.spinButton = new SpinButton(assets, handleSpin, handleReplay);
    this.spinButton.container.position.set(
      Layout.CX,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.container.addChild(this.spinButton.container);
    window.addEventListener('keydown', (e) => {
      if (e.code !== 'Space' || e.repeat) return;

      e.preventDefault();

      if (this.spinButton.button.eventMode === 'none') return; // disabled

      this.spinButton.button.scale.set(0.95);
      this.spinButton.press();
    });
    window.addEventListener('keyup', (e) => {
      if (e.code !== 'Space') return;

      this.spinButton.button.scale.set(1);
    });

    this.turboModeButton = new ToggleButton(
      assets,
      assets.bolt,
      assets.boltFilled,
      () => {
        turboMode.set(!get(turboMode));
      },
    );
    this.turboModeButton.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.95,
      Layout.VIRTUAL_HEIGHT * 0.9,
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

  public async showBonusGameUI() {
    this.bonusHeadline.container.visible = true;
  }
  public async hideBonusGameUI() {
    this.bonusHeadline.container.visible = false;
  }

  public updateSpinButtonText(isBonus: boolean) {
    if (isBonus) {
      this.spinButton.text.texture = this.assets.openAll;
    } else {
      this.spinButton.text.texture = this.assets.spinText;
    }
  }

  public onOrientationChange(orientation: 'landscape' | 'portrait') {
    if (orientation === 'portrait') {
      this.rerenderToPortrait();
    } else {
      this.rerenderToLandscape();
    }
    this.gameHistory.rerenderRecords(orientation);
  }

  private rerenderToPortrait() {
    this.spinButton.container.position.set(
      Layout.CX,
      Layout.VIRTUAL_HEIGHT * 0.875,
    );
    this.balance.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.2,
      Layout.VIRTUAL_HEIGHT * 0.95,
    );
    this.lastWin.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.785,
      Layout.VIRTUAL_HEIGHT * 0.95,
    );
    this.turboModeButton.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.95,
      Layout.VIRTUAL_HEIGHT * 0.95,
    );
    this.burgerMenu.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.05,
      Layout.VIRTUAL_HEIGHT * 0.95,
    );
    this.betSelector.container.position.set(
      Layout.CX,
      Layout.VIRTUAL_HEIGHT * 0.95,
    );

    const autospinX = Layout.VIRTUAL_WIDTH * 0.85;
    const autospinY = Layout.VIRTUAL_HEIGHT * 0.875;
    this.stopAutospinButton.container.position.set(autospinX, autospinY);
    this.autospinButton.container.position.set(autospinX, autospinY);

    this.gameHistory.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.04,
      Layout.VIRTUAL_HEIGHT * 0.05,
    );
    this.bonusHeadline.rerenderToPortrait();
  }

  private rerenderToLandscape() {
    this.spinButton.container.position.set(
      Layout.CX,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.balance.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.132,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.lastWin.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.85,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.turboModeButton.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.95,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.burgerMenu.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.045,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.betSelector.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.285,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );

    this.stopAutospinButton.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.7,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );
    this.autospinButton.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.7,
      Layout.VIRTUAL_HEIGHT * 0.9,
    );

    this.gameHistory.container.position.set(
      Layout.VIRTUAL_WIDTH * 0.9,
      Layout.VIRTUAL_HEIGHT * 0.05,
    );
    this.bonusHeadline.rerenderToLandscape();
  }
}
