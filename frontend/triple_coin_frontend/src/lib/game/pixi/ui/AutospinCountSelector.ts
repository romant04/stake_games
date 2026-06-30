import { Container, Text, TextStyle } from 'pixi.js';
import { SelectionButton } from './SelectionButton';
import type { GameAssets } from '../../../../types/assets';

export class AutospinCountSelector {
  readonly container: Container;
  public selectedOption: number = 100;
  private selectionOptions = [10, 50, 100, 250, 500, 1000];

  private selectionButtons: SelectionButton[] = [];

  public constructor(private readonly assets: GameAssets) {
    this.container = new Container();

    const headline = new Text({
      text: 'NUMBER OF AUTOSPINS',
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 28,
        fill: 0xeec53a,
        fontWeight: 'bold',

        stroke: {
          color: 0x3c0e00,
          width: 5,
        },
      }),
    });
    headline.anchor.set(0.5);
    headline.position.set(0, -200);
    this.container.addChild(headline);

    const selectionButtonsContainer = new Container();
    selectionButtonsContainer.position.set(0, -130);
    this.container.addChild(selectionButtonsContainer);

    const COLS = 4;
    const GAP = 4;
    const BTN_WIDTH = 138;
    const BTN_HEIGHT = 72;

    // Calculate the distance from the center of the first button to the center of the last button
    const totalGridWidth = (COLS - 1) * (BTN_WIDTH + GAP); // 3 * (138 + 16) = 462

    this.selectionOptions.forEach((option, index) => {
      const btn = new SelectionButton(assets, option, (value: number) => {
        this.selectedOption = option;
        this.selectionButtons.forEach((b) => {
          b.selected = b.value === value;
          b.update();
        });
      });
      this.selectionButtons.push(btn);

      const row = Math.floor(index / COLS);
      const col = index % COLS;

      // Row 0 has 4 items. Row 1 has 2 items.
      // To center 2 items perfectly under 4 items:
      // Center of Row 0 is at local x = totalGridWidth / 2
      // Center of Row 1 (2 items) spans exactly 1 gap + 1 button width.
      let xOffset = 0;
      if (row === 1) {
        xOffset = BTN_WIDTH + GAP;
      }

      // Calculate local X position relative to the grid start
      const localX = col * (BTN_WIDTH + GAP) + xOffset;

      // Center it perfectly around X = 0 by subtracting half the total grid span
      const centeredX = localX - totalGridWidth / 2;

      btn.container.position.set(centeredX, row * (BTN_HEIGHT + GAP));

      selectionButtonsContainer.addChild(btn.container);
    });
  }
}
