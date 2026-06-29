import { Container, Sprite, Text, TextStyle } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { CX, CY, VIRTUAL_HEIGHT, VIRTUAL_WIDTH } from '../constants/layout';
import { GameHistory } from '../ui/GameHistory';
import { SpinButton } from '../ui/SpinButton';
import { ToggleButton } from '../ui/ToggleButton';
import {
  isAutoplayOpen,
  isGameInfoOpen,
  turboMode,
} from '../../../stores/game';
import { get } from 'svelte/store';
import { BalanceText } from '../ui/BalanceText';
import { BetAmountSelector } from '../ui/BetAmountSelector';
import { SmallButton } from '../ui/SmallButton';
import { AutospinButton } from '../ui/AutospinButton';
import { LastWin } from '../ui/LastWin';

export class UIManager {
  readonly container: Container;
  public readonly gameHistory: GameHistory;
  public readonly spinButton: SpinButton;

  public readonly turboModeButton: ToggleButton;
  public readonly balance: BalanceText;
  public readonly lastWin: LastWin;

  constructor(
    private readonly assets: GameAssets,
    private readonly handleSpin: () => void,
  ) {
    this.container = new Container();

    this.balance = new BalanceText();
    this.balance.container.position.set(
      VIRTUAL_WIDTH * 0.125,
      VIRTUAL_HEIGHT * 0.9,
    );
    this.container.addChild(this.balance.container);
    this.lastWin = new LastWin();
    this.lastWin.container.position.set(
      VIRTUAL_WIDTH * 0.865,
      VIRTUAL_HEIGHT * 0.9,
    );
    this.container.addChild(this.lastWin.container);

    const burgerMenu = new SmallButton(
      assets,
      { x: VIRTUAL_WIDTH * 0.02, y: VIRTUAL_HEIGHT * 0.9 },
      assets.hamburger,
      () => {
        isGameInfoOpen.set(!get(isGameInfoOpen));
      },
    );
    this.container.addChild(burgerMenu.container);

    const balanceSelector = new BetAmountSelector(assets);
    balanceSelector.container.position.set(
      VIRTUAL_WIDTH * 0.285,
      VIRTUAL_HEIGHT * 0.9,
    );
    this.container.addChild(balanceSelector.container);

    const autospinButton = new AutospinButton(
      assets,
      { x: VIRTUAL_WIDTH * 0.7, y: VIRTUAL_HEIGHT * 0.9 },
      assets.hamburger,
      () => {
        isAutoplayOpen.set(!get(isAutoplayOpen));
      },
    );
    this.container.addChild(autospinButton.container);

    const winTable = new Sprite(assets.winTable);
    winTable.anchor.set(0.5);
    winTable.position.set(VIRTUAL_WIDTH * 0.175, CY + 20);
    winTable.width = 600;
    winTable.height = 850;
    this.container.addChild(winTable);

    this.spinButton = new SpinButton(assets, handleSpin);
    this.spinButton.container.position.set(0, VIRTUAL_HEIGHT * 0.9);
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
      { x: VIRTUAL_WIDTH * 0.98, y: VIRTUAL_HEIGHT * 0.9 },
      assets.bolt,
      assets.boltFilled,
      () => {
        turboMode.set(!get(turboMode));
      },
    );
    this.container.addChild(this.turboModeButton.container);

    this.gameHistory = new GameHistory(assets);
    this.gameHistory.container.position.set(
      VIRTUAL_WIDTH * 0.95,
      VIRTUAL_HEIGHT * 0.05,
    );
    this.container.addChild(this.gameHistory.container);
  }
}
