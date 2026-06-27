import type { GameAssets } from '../../../../types/assets';
import { Assets } from 'pixi.js';

// ---------------------------------------------------------------------------
// Asset imports
// ---------------------------------------------------------------------------

import bgSrc from '../../../../assets/bg.png';
import sideSrc from '../../../../assets/game/side.png';
import coinsBgSrc from '../../../../assets/game/coins_bg.png';
import chestClosedSrc from '../../../../assets/game/chest_closed.png';
import chestOpenedSrc from '../../../../assets/game/chest_opened.png';
import logoSrc from '../../../../assets/logo.png';
import winTableSrc from '../../../../assets/win_table.png';

const frontModules = import.meta.glob(
  '../../../../assets/game/front/front_*.png',
  {
    eager: true,
    import: 'default',
  },
);
const frontModulesFlopped = import.meta.glob(
  '../../../../assets/game/front/mirrored/front_*.png',
  { eager: true, import: 'default' },
);
const backModules = import.meta.glob(
  '../../../../assets/game/back/back_*.png',
  {
    eager: true,
    import: 'default',
  },
);
const backModulesFlopped = import.meta.glob(
  '../../../../assets/game/back/mirrored/back_*.png',
  { eager: true, import: 'default' },
);

const sortedEntries = (modules: Record<string, unknown>) =>
  Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, src]) => src as string);

const frontImages = sortedEntries(frontModules);
const frontImagesFlopped = sortedEntries(frontModulesFlopped);
const backImages = sortedEntries(backModules);
const backImagesFlopped = sortedEntries(backModulesFlopped);

// utils/loadAssets.ts
export async function loadAssets(): Promise<GameAssets> {
  const [bg, coinsBg, coinSide, chestClosed, chestOpened, logo, winTable] =
    await Promise.all([
      Assets.load(bgSrc),
      Assets.load(coinsBgSrc),
      Assets.load(sideSrc),
      Assets.load(chestClosedSrc),
      Assets.load(chestOpenedSrc),
      Assets.load(logoSrc),
      Assets.load(winTableSrc),
    ]);

  const [coinFront, coinFrontFlopped, coinBack, coinBackFlopped] =
    await Promise.all([
      Promise.all(frontImages.map((s) => Assets.load(s))),
      Promise.all(frontImagesFlopped.map((s) => Assets.load(s))),
      Promise.all(backImages.map((s) => Assets.load(s))),
      Promise.all(backImagesFlopped.map((s) => Assets.load(s))),
    ]);

  return {
    bg,
    logo,
    winTable,
    coinsBg,
    coinSide,
    chestClosed,
    chestOpened,
    coinFront,
    coinFrontFlopped,
    coinBack,
    coinBackFlopped,
  };
}
