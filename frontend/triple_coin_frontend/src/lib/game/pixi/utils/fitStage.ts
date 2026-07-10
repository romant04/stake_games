import type { Application, Container, Sprite } from 'pixi.js';
import type { AutoplayMenu } from '../ui/AutoplayMenu';
import { Layout, VIRTUAL_SIZES } from '../constants/layout';
import type { InfoOverlay } from '../ui/InfoOverlay';

/**
 * Scales `app.stage` uniformly so the virtual 1920×1080 canvas fits inside
 * whatever real screen size the browser gives us (letterbox / pillarbox).
 *
 * Call this once on mount and again inside every ResizeObserver callback.
 */
export function fitStageToScreen(
  app: Application,
  orientation: 'landscape' | 'portrait',
  background?: Sprite,
  fog?: Sprite,
  autoplayMenu?: AutoplayMenu,
  infoOverlay?: InfoOverlay,
): void {
  Layout.setOrientation(orientation);
  const { width: VIRTUAL_WIDTH, height: VIRTUAL_HEIGHT } =
    VIRTUAL_SIZES[orientation];

  const realW = app.renderer.width;
  const realH = app.renderer.height;

  const scale = Math.min(realW / VIRTUAL_WIDTH, realH / VIRTUAL_HEIGHT);

  app.stage.scale.set(scale);
  app.stage.x = (realW - VIRTUAL_WIDTH * scale) / 2;
  app.stage.y = (realH - VIRTUAL_HEIGHT * scale) / 2;

  const visibleVirtualW = realW / scale;
  const visibleVirtualH = realH / scale;

  if (background) {
    background.width = visibleVirtualW;
    background.height = visibleVirtualH;
    background.position.set(VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2);
  }

  if (autoplayMenu && autoplayMenu.dimBackground) {
    const padding = 64;

    autoplayMenu.dimBackground.width = visibleVirtualW + padding * 2;
    autoplayMenu.dimBackground.height = visibleVirtualH + padding * 2;

    const startX = (VIRTUAL_WIDTH - visibleVirtualW) / 2;
    const startY = (VIRTUAL_HEIGHT - visibleVirtualH) / 2;
    autoplayMenu.dimBackground.position.set(startX - padding, startY - padding);
  }
  if (infoOverlay && infoOverlay.dimBackground) {
    const padding = 64;

    infoOverlay.dimBackground.width = visibleVirtualW + padding * 2;
    infoOverlay.dimBackground.height = visibleVirtualH + padding * 2;

    const startX = (VIRTUAL_WIDTH - visibleVirtualW) / 2;
    const startY = (VIRTUAL_HEIGHT - visibleVirtualH) / 2;
    infoOverlay.dimBackground.position.set(startX - padding, startY - padding);
  }

  if (fog) {
    // Position to the bottom and span the whole screen
    fog.width = visibleVirtualW * 2;
    fog.height = visibleVirtualH;
    fog.anchor.set(0.5, 0);
    fog.position.set(VIRTUAL_WIDTH / 2, 50);
  }
}
