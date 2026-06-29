import { Container, Text, TextStyle } from 'pixi.js';
import { get } from 'svelte/store';
import { balance, currency, lastWin } from '../../../stores/game';
import { formatNumber } from '../../utils/formatNumber';
import { API_MULTIPLIER } from '../../../../constants/api';

export class LastWin {
  readonly container: Container;

  private readonly lastWinValue: Text;

  public constructor() {
    this.container = new Container();

    const lastWinHeadline = new Text({
      text: 'LAST WIN',
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 24,
        fill: 0xece7c4,
        fontWeight: 'bold',
        padding: 8,

        stroke: {
          color: 0x3c0e00,
          width: 5,
        },
      }),
    });
    lastWinHeadline.anchor.set(0.5);
    lastWinHeadline.position.set(0, -15);
    this.container.addChild(lastWinHeadline);

    this.lastWinValue = new Text({
      text: `${get(currency)} ${formatNumber((get(lastWin) as number) / API_MULTIPLIER)}`,
      style: new TextStyle({
        fontFamily: 'Merriweather',
        fontSize: 28,
        fill: 0xe1b314,
        fontWeight: 'bold',
        trim: false,

        stroke: {
          color: 0x3c0e00,
          width: 5,
        },
      }),
    });
    this.lastWinValue.anchor.set(0.5);
    this.lastWinValue.position.set(0, 15);
    this.container.addChild(this.lastWinValue);
  }

  public updateLastWin() {
    this.lastWinValue.text = `${get(currency)} ${formatNumber((get(lastWin) as number) / API_MULTIPLIER)}`;
  }
}
