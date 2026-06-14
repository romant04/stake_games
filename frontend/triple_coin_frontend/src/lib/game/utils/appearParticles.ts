import { type Container, Graphics, Sprite, Texture, Ticker } from 'pixi.js';

export function createAppearParticles(x: number, y: number, parent: Container) {
  const particles: Graphics[] = [];

  for (let i = 0; i < 30; i++) {
    const particle = new Graphics()
      .circle(0, 0, 3 + Math.random() * 4)
      .fill(0xffd700);

    particle.x = x;
    particle.y = y;

    const angle = Math.random() * Math.PI * 2.5;
    const speed = 1 + Math.random() * 4;

    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    particle.alpha = 1;

    parent.addChildAt(particle, 1);
    particles.push(particle);

    const update = (ticker: Ticker) => {
      particle.x += vx;
      particle.y += vy;

      particle.alpha -= 0.02;
      particle.scale.x *= 0.98;
      particle.scale.y *= 0.98;

      if (particle.alpha <= 0) {
        Ticker.shared.remove(update);
        particle.destroy();
      }
    };

    Ticker.shared.add(update);
  }
}
