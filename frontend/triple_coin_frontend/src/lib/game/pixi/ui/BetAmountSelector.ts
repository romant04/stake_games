import { Container, Sprite, Text, TextStyle } from 'pixi.js';
import type { GameAssets } from '../../../../types/assets';
import { SmallButton } from './SmallButton';
import { get } from 'svelte/store';
import {
  allowedBets,
  balance,
  betAmount,
  currency,
} from '../../../stores/game';
import { formatNumber } from '../../utils/formatNumber';
import { API_MULTIPLIER } from '../../../../constants/api';

export class BetAmountSelector {
  readonly container: Container;

  private readonly betValue: Text;

  public constructor(private readonly assets: GameAssets) {
    this.container = new Container();

    const bg = new Sprite(assets.button);
    bg.anchor.set(0.5);
    bg.position.set(0, 0);
    bg.width = 300;
    bg.height = 80;
    this.container.addChild(bg);

    const plusButton = new SmallButton(
      assets,
      { x: 120, y: 0 },
      assets.plus,
      () => this.increaseBet(),
    );
    this.container.addChild(plusButton.container);

    const minusButton = new SmallButton(
      assets,
      { x: -120, y: 0 },
      assets.minus,
      () => this.decreaseBet(),
    );
    this.container.addChild(minusButton.container);

    const betHeadline = new Text({
      text: 'BET',
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 20,
        fill: 0xece7c4,
        fontWeight: 'bold',

        stroke: {
          color: 0x3c0e00,
          width: 5,
        },
      }),
    });
    betHeadline.anchor.set(0.5);
    betHeadline.position.set(0, -14);
    this.container.addChild(betHeadline);

    this.betValue = new Text({
      text: `${get(currency)} ${formatNumber(get(betAmount))}`,
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 24,
        fill: 0xe1b314,
        fontWeight: 'bold',

        stroke: {
          color: 0x3c0e00,
          width: 5,
        },
      }),
    });
    this.betValue.anchor.set(0.5);
    this.betValue.position.set(0, 12);
    this.container.addChild(this.betValue);
  }

  private increaseBet() {
    this.handleBetAmountChange(true);
    this.betValue.text = `${get(currency)} ${formatNumber(get(betAmount))}`;
  }
  private decreaseBet() {
    this.handleBetAmountChange(false);
    this.betValue.text = `${get(currency)} ${formatNumber(get(betAmount))}`;
  }
  private handleBetAmountChange(increment: boolean) {
    const maxBet = (get(balance) as number) / API_MULTIPLIER;
    const viableBets = get(allowedBets);
    if (increment) {
      const nextBet = viableBets.find((b) => b > get(betAmount) && b <= maxBet);
      if (nextBet) {
        betAmount.set(nextBet);
        return;
      }

      const biggestBet = [...viableBets].reverse().find((b) => b <= maxBet);
      if (biggestBet) {
        betAmount.set(biggestBet);
      }
    } else {
      const prevBet = [...viableBets]
        .reverse()
        .find((b) => b < get(betAmount) && b <= maxBet);
      if (prevBet) {
        betAmount.set(prevBet);
      }
    }
  }
}
