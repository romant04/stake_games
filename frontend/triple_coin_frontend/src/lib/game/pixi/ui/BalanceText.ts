import { Container, Text, TextStyle } from 'pixi.js';
import { get } from 'svelte/store';
import { balance, currency } from '../../../stores/game';
import { formatNumber } from '../../utils/formatNumber';
import { API_MULTIPLIER } from '../../../../constants/api';

export class BalanceText {
  readonly container: Container;

  private readonly balanceValue: Text;

  public constructor() {
    this.container = new Container();

    const balanceHeadline = new Text({
      text: 'BALANCE',
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
    balanceHeadline.anchor.set(0.5);
    balanceHeadline.position.set(0, -15);
    this.container.addChild(balanceHeadline);

    this.balanceValue = new Text({
      text: `${get(currency)} ${formatNumber((get(balance) as number) / API_MULTIPLIER)}`,
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
    this.balanceValue.anchor.set(0.5);
    this.balanceValue.position.set(0, 15);
    this.container.addChild(this.balanceValue);
  }

  public updateBalance() {
    this.balanceValue.text = `${get(currency)} ${formatNumber((get(balance) as number) / API_MULTIPLIER)}`;
  }
}
