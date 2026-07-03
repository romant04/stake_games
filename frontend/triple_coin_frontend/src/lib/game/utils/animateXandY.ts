import { Container, type Ticker } from 'pixi.js';

export async function animateY(
  ticker: Ticker,
  target: Container,
  toY: number,
  duration = 500,
): Promise<void> {
  return new Promise((resolve) => {
    const fromY = target.y;
    const distance = toY - fromY;
    let elapsed = 0;

    const update = (ticker: Ticker) => {
      elapsed += ticker.deltaMS;

      const t = Math.min(elapsed / duration, 1);

      // Ease in/out
      const eased = 1 - Math.pow(1 - t, 3);

      target.y = fromY + distance * eased;

      if (t >= 1) {
        target.y = toY;
        ticker.remove(update);
        resolve();
      }
    };

    ticker.add(update);
  });
}
export async function animateX(
  ticker: Ticker,
  target: Container,
  toX: number,
  duration = 500,
): Promise<void> {
  return new Promise((resolve) => {
    const fromX = target.x;
    const distance = toX - fromX;
    let elapsed = 0;

    const update = (ticker: Ticker) => {
      elapsed += ticker.deltaMS;

      const t = Math.min(elapsed / duration, 1);

      // Ease in/out
      const eased = 1 - Math.pow(1 - t, 3);

      target.x = fromX + distance * eased;

      if (t >= 1) {
        target.x = toX;
        ticker.remove(update);
        resolve();
      }
    };

    ticker.add(update);
  });
}
