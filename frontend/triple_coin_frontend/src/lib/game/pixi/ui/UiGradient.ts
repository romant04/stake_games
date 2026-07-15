import { Container, FillGradient, Graphics } from 'pixi.js';
import { Layout } from '../constants/layout';

export class UiGradient {
  readonly container: Container;
  readonly overlay: Graphics;
  public constructor() {
    this.container = new Container();

    const gradient = new FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      colorStops: [
        { offset: 0, color: 'rgba(0, 0, 0, 0)' }, // transparent black
        { offset: 1, color: 'rgba(0, 0, 0, 0.5)' }, // black with ~50% alpha
      ],
    });

    this.overlay = new Graphics();

    this.overlay.rect(0, 0, 1920, 600);
    this.overlay.fill(gradient);

    this.container.addChild(this.overlay);
  }

  public resize(width: number, height: number) {
    this.overlay.clear();

    const gradient = new FillGradient({
      type: 'linear',
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
      colorStops: [
        { offset: 0, color: 'rgba(0, 0, 0, 0)' },
        { offset: 1, color: 'rgba(0, 0, 0, 0.5)' },
      ],
    });

    this.overlay.rect(0, 0, width, height).fill(gradient);
  }
}
