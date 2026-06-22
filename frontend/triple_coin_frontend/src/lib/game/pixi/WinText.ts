import { Text, TextStyle, Container, type Application } from 'pixi.js';
import { get } from 'svelte/store';
import { currency } from '../../stores/game';
import { getCurrencySymbol } from '../utils/currencySymbols';

export class WinText {
  container: Container;
  text: Text;

  private tickerRef?: any;

  constructor() {
    this.container = new Container();

    this.text = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0x00d12b,
        fontWeight: 'bold',
      }),
    });

    this.text.anchor.set(0.5);

    this.container.addChild(this.text);

    this.reset();
  }

  show(app: Application, amount: number) {
    this.text.text = `+${amount}${getCurrencySymbol(get(currency) as string) ?? ''}`;

    const scale = Math.min(app.screen.width, app.screen.height) / 1000;

    this.text.style.fontSize = 64 * scale;

    this.text.anchor.set(0.5);

    this.text.x = app.screen.width / 2;
    this.text.y = app.screen.height / 2 - 80;

    this.reset();

    let elapsed = 0;

    const animate = (ticker: any) => {
      elapsed += ticker.deltaMS;

      if (elapsed < 400) {
        const t = elapsed / 400;

        this.text.alpha = t;
        this.text.y = app.screen.height / 2 - 100 - (1 - t) * 30;
        this.text.scale.set(0.5 + t * 0.5);
      } else if (elapsed < 700) {
        this.text.alpha = 1;
        this.text.scale.set(1);
      } else if (elapsed < 1000) {
        const t = (elapsed - 700) / 300;
        this.text.alpha = 1 - t;
      } else {
        this.reset();
        app.ticker.remove(animate);
      }
    };

    app.ticker.add(animate);
  }

  reset() {
    this.text.alpha = 0;
    this.text.scale.set(0.5);
    this.text.y = 0;
  }
}
