import { Text, TextStyle, Container, Ticker } from 'pixi.js';
import { CX, CY } from '../constants/layout';

/**
 * Floating win-amount text that animates in, holds, then fades out.
 *
 * Lives in virtual 1920×1080 space — no reference to real screen size needed.
 * Add `this.container` to the stage once; call `show()` each time a win occurs.
 */
export class WinText {
  readonly container: Container;

  private readonly text: Text;
  private activeHandler: ((ticker: Ticker) => void) | null = null;

  constructor() {
    this.container = new Container();

    this.text = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 86,
        fill: 0xffffff,
        fontWeight: 'bold',
        dropShadow: {
          distance: 4,
          alpha: 0.6,
        },
      }),
    });

    this.text.anchor.set(0.5);
    this.container.addChild(this.text);
    this.hide();
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Display the win amount with a pop-in → hold → fade-out animation.
   * Safe to call while a previous animation is still running — it cancels it.
   */
  show(amount: number, label = ''): void {
    this.cancelAnimation();

    this.text.text = label ? `+${amount}${label} ` : `+${amount}`;
    const yOffset = 140;
    this.text.position.set(CX, CY + yOffset);
    this.text.alpha = 0;
    this.text.scale.set(0.5);

    let elapsed = 0;

    const handler = (ticker: Ticker) => {
      elapsed += ticker.deltaMS;

      if (elapsed < 400) {
        const t = elapsed / 400;
        this.text.alpha = t;
        this.text.y = CY + yOffset - (1 - t) * 30;
        this.text.scale.set(0.5 + t * 0.5);
      } else if (elapsed < 700) {
        this.text.alpha = 1;
        this.text.scale.set(1);
      } else if (elapsed < 1000) {
        const t = (elapsed - 700) / 300;
        this.text.alpha = 1 - t;
      } else {
        this.hide();
        this.cancelAnimation();
      }
    };

    this.activeHandler = handler;
    Ticker.shared.add(handler);
  }

  // ---------------------------------------------------------------------------
  // Private
  // ---------------------------------------------------------------------------

  private hide(): void {
    this.text.alpha = 0;
    this.text.scale.set(0.5);
  }

  private cancelAnimation(): void {
    if (this.activeHandler) {
      Ticker.shared.remove(this.activeHandler);
      this.activeHandler = null;
    }
  }
}
