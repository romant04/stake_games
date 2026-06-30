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
import spinSrc from '../../../../assets/ui/spin.png';
import spinHoverSrc from '../../../../assets/ui/spin_hover.png';
import spinDisabledSrc from '../../../../assets/ui/spin_disabled.png';
import spinTextSrc from '../../../../assets/ui/spin_text.png';

import frontSrcUI from '../../../../assets/ui/front.png';
import sideSrcUI from '../../../../assets/ui/side.png';
import backSrcUI from '../../../../assets/ui/back.png';

import toggleSrc from '../../../../assets/ui/toggle.png';
import toggleHoverSrc from '../../../../assets/ui/toggle_hover.png';
import toggleDisabledSrc from '../../../../assets/ui/toggle_disabled.png';
import toggleActiveSrc from '../../../../assets/ui/toggle_active.png';
import toggleActiveHoverSrc from '../../../../assets/ui/toggle_active_hover.png';
import buttonSrc from '../../../../assets/ui/button.png';
import buttonHoverSrc from '../../../../assets/ui/button_hover.png';
import buttonDisabledSrc from '../../../../assets/ui/button_disabled.png';

import autospinModalBgSrc from '../../../../assets/ui/autospin/autospin_bg.png';
import checkboxSrc from '../../../../assets/ui/autospin/checkbox.png';
import checkboxHoverSrc from '../../../../assets/ui/autospin/checkbox_hover.png';
import checkboxActiveSrc from '../../../../assets/ui/autospin/checkbox_active.png';
import checkboxActiveHoverSrc from '../../../../assets/ui/autospin/checkbox_active_hover.png';
import selectionButtonSrc from '../../../../assets/ui/autospin/selection_button.png';
import selectionButtonHoverSrc from '../../../../assets/ui/autospin/selection_button_hover.png';
import selectionButtonActiveSrc from '../../../../assets/ui/autospin/selection_button_active.png';
import selectionButtonActiveHoverSrc from '../../../../assets/ui/autospin/selection_button_active_hover.png';
import startAutospinSrc from '../../../../assets/ui/autospin/start_autospin.png';
import startAutospinHoverSrc from '../../../../assets/ui/autospin/start_autospin_hover.png';

import boltSrc from '../../../../assets/icons/bolt.png';
import boltFilledSrc from '../../../../assets/icons/bolt_filled.png';
import plusSrc from '../../../../assets/icons/plus.png';
import minusSrc from '../../../../assets/icons/minus.png';
import hamburgerSrc from '../../../../assets/icons/hamburger.png';
import closeSrc from '../../../../assets/icons/close.png';

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
  const [
    bg,
    coinsBg,
    coinSide,
    chestClosed,
    chestOpened,
    logo,
    winTable,
    spin,
    spinHover,
    spinDisabled,
    spinText,
    front,
    side,
    back,
    toggle,
    toggleHover,
    toggleDisabled,
    toggleActive,
    toggleActiveHover,
    bolt,
    boltFilled,
    button,
    buttonHover,
    buttonDisabled,
    plus,
    minus,
    hamburger,
    autospinModalBg,
    close,
    checkbox,
    checkboxHover,
    checkboxActive,
    checkboxActiveHover,
    selectionButton,
    selectionButtonHover,
    selectionButtonActive,
    selectionButtonActiveHover,
    startAutospin,
    startAutospinHover,
  ] = await Promise.all([
    Assets.load(bgSrc),
    Assets.load(coinsBgSrc),
    Assets.load(sideSrc),
    Assets.load(chestClosedSrc),
    Assets.load(chestOpenedSrc),
    Assets.load(logoSrc),
    Assets.load(winTableSrc),
    Assets.load(spinSrc),
    Assets.load(spinHoverSrc),
    Assets.load(spinDisabledSrc),
    Assets.load(spinTextSrc),
    Assets.load(frontSrcUI),
    Assets.load(sideSrcUI),
    Assets.load(backSrcUI),
    Assets.load(toggleSrc),
    Assets.load(toggleHoverSrc),
    Assets.load(toggleDisabledSrc),
    Assets.load(toggleActiveSrc),
    Assets.load(toggleActiveHoverSrc),
    Assets.load(boltSrc),
    Assets.load(boltFilledSrc),
    Assets.load(buttonSrc),
    Assets.load(buttonHoverSrc),
    Assets.load(buttonDisabledSrc),
    Assets.load(plusSrc),
    Assets.load(minusSrc),
    Assets.load(hamburgerSrc),
    Assets.load(autospinModalBgSrc),
    Assets.load(closeSrc),
    Assets.load(checkboxSrc),
    Assets.load(checkboxHoverSrc),
    Assets.load(checkboxActiveSrc),
    Assets.load(checkboxActiveHoverSrc),
    Assets.load(selectionButtonSrc),
    Assets.load(selectionButtonHoverSrc),
    Assets.load(selectionButtonActiveSrc),
    Assets.load(selectionButtonActiveHoverSrc),
    Assets.load(startAutospinSrc),
    Assets.load(startAutospinHoverSrc),
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
    spin,
    spinHover,
    spinDisabled,
    spinText,
    front,
    side,
    back,
    toggle,
    toggleHover,
    toggleDisabled,
    toggleActive,
    toggleActiveHover,
    bolt,
    boltFilled,
    button,
    buttonHover,
    buttonDisabled,
    plus,
    minus,
    hamburger,
    autospinModalBg,
    close,
    checkbox,
    checkboxHover,
    checkboxActive,
    checkboxActiveHover,
    selectionButton,
    selectionButtonHover,
    selectionButtonActive,
    selectionButtonActiveHover,
    startAutospin,
    startAutospinHover,
  };
}
