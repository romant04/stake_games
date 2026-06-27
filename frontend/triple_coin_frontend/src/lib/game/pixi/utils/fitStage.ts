import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../constants/layout';
import type { Application, Container, Sprite } from 'pixi.js';

/**
 * Scales `app.stage` uniformly so the virtual 1920×1080 canvas fits inside
 * whatever real screen size the browser gives us (letterbox / pillarbox).
 *
 * Call this once on mount and again inside every ResizeObserver callback.
 */
// fitStage.ts
export function fitStageToScreen(
  app: Application,
  background?: Sprite,
  rigidContainers?: { container: Container; minScale: number }[],
): void {
  const realW = app.renderer.width;
  const realH = app.renderer.height;

  const scale = Math.min(realW / VIRTUAL_WIDTH, realH / VIRTUAL_HEIGHT);

  app.stage.scale.set(scale);
  app.stage.x = (realW - VIRTUAL_WIDTH * scale) / 2;
  app.stage.y = (realH - VIRTUAL_HEIGHT * scale) / 2;

  if (background) {
    background.width = realW / scale;
    background.height = realH / scale;
    background.position.set(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2);
  }

  // Each rigid container counteracts the stage scale partially
  rigidContainers?.forEach(({ container, minScale }) => {
    console.log(scale, minScale);
    if (scale < minScale) {
      // Stage is scaling down past our minimum — push back
      container.scale.set(minScale / scale);
    } else {
      container.scale.set(1);
    }
  });
}
