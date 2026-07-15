import type { GameAssets } from '../../../../types/assets';
import { Assets } from 'pixi.js';

// ---------------------------------------------------------------------------
// Asset imports
// ---------------------------------------------------------------------------

import bgSrc from '../../../../assets/bg.png';
import bgMobileSrc from '../../../../assets/bg_mobile.png';
import sideSrc from '../../../../assets/game/side.png';
import coinsBgSrc from '../../../../assets/game/coins_bg.png';
import logoSrc from '../../../../assets/logo.png';
import winTableSrc from '../../../../assets/win_table.png';
import spinSrc from '../../../../assets/ui/spin.png';
import spinHoverSrc from '../../../../assets/ui/spin_hover.png';
import spinDisabledSrc from '../../../../assets/ui/spin_disabled.png';
import spinTextSrc from '../../../../assets/ui/spin_text.png';
import gameRulesSrc from '../../../../assets/info_headline.png';

import frontSrcUI from '../../../../assets/ui/front.png';
import sideSrcUI from '../../../../assets/ui/side.png';
import backSrcUI from '../../../../assets/ui/back.png';
import emptySrc from '../../../../assets/ui/info_lose.png';

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

import bonusHeadlineSrc from '../../../../assets/game/bonus/bonus_headline.png';
import chestLabelSrc from '../../../../assets/game/bonus/chest_label.png';
import fogSrc from '../../../../assets/game/bonus/fog.png';
import pedestalSrc from '../../../../assets/game/bonus/pedestal.png';
import openAllSrc from '../../../../assets/game/bonus/open_all.png';

import spinSoundSrc from '../../../../assets/sounds/spin.mp3';
import clickSoundSrc from '../../../../assets/sounds/click.mp3';
import primaryClickSoundSrc from '../../../../assets/sounds/primary-click.mp3';
import winSoundSrc from '../../../../assets/sounds/win.mp3';
import bonusSoundUnlockSrc from '../../../../assets/sounds/bonus-game-unlock.mp3';
import backgroundSoundSrc from '../../../../assets/sounds/background.mp3';
import backgroundBonusSoundSrc from '../../../../assets/sounds/bonus/background.mp3';
import appearSoundSrc from '../../../../assets/sounds/bonus/appear.mp3';
import revealSoundSrc from '../../../../assets/sounds/bonus/reveal.mp3';
import bonusWinSoundSrc from '../../../../assets/sounds/bonus/bonus_win.mp3';

import { sound } from '@pixi/sound';
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
const chest1OpenedModules = import.meta.glob(
  '../../../../assets/game/bonus/chest_1/*.png',
  { eager: true, import: 'default' },
);
const chest2OpenedModules = import.meta.glob(
  '../../../../assets/game/bonus/chest_2/*.png',
  { eager: true, import: 'default' },
);
const chest3OpenedModules = import.meta.glob(
  '../../../../assets/game/bonus/chest_3/*.png',
  { eager: true, import: 'default' },
);
const win = import.meta.glob('../../../../assets/game/bonus/win_screen/*.png', {
  eager: true,
  import: 'default',
});

const sortedEntries = (modules: Record<string, unknown>) =>
  Object.entries(modules)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, src]) => src as string);

const frontImages = sortedEntries(frontModules);
const frontImagesFlopped = sortedEntries(frontModulesFlopped);
const backImages = sortedEntries(backModules);
const backImagesFlopped = sortedEntries(backModulesFlopped);

const chest1Images = sortedEntries(chest1OpenedModules);
const chest2Images = sortedEntries(chest2OpenedModules);
const chest3Images = sortedEntries(chest3OpenedModules);
const winImages = sortedEntries(win);

const soundsLoaded = new Set<string>();
function addSound(alias: string, src: any) {
  if (soundsLoaded.has(alias)) return;
  if (sound.exists(alias)) return;

  sound.add(alias, src);
  soundsLoaded.add(alias);
}

// utils/loadAssets.ts
export async function loadAssets(): Promise<GameAssets> {
  const [
    bg,
    bgMobile,
    coinsBg,
    coinSide,
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
    bonusHeadline,
    chestLabel,
    fog,
    pedestal,
    openAll,
    empty,
    gameRules,
    spinSound,
    clickSound,
    primaryClickSound,
    winSound,
    bonusSoundUnlock,
    backgroundSound,
    backgroundBonusSound,
    appearSound,
    revealSound,
    bonusWinSound,
  ] = await Promise.all([
    Assets.load(bgSrc),
    Assets.load(bgMobileSrc),
    Assets.load(coinsBgSrc),
    Assets.load(sideSrc),
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
    Assets.load(bonusHeadlineSrc),
    Assets.load(chestLabelSrc),
    Assets.load(fogSrc),
    Assets.load(pedestalSrc),
    Assets.load(openAllSrc),
    Assets.load(emptySrc),
    Assets.load(gameRulesSrc),
    Assets.load(spinSoundSrc),
    Assets.load(clickSoundSrc),
    Assets.load(primaryClickSoundSrc),
    Assets.load(winSoundSrc),
    Assets.load(bonusSoundUnlockSrc),
    Assets.load(backgroundSoundSrc),
    Assets.load(backgroundBonusSoundSrc),
    Assets.load(appearSoundSrc),
    Assets.load(revealSoundSrc),
    Assets.load(bonusWinSoundSrc),
  ]);
  addSound('spin', spinSound);
  addSound('click', clickSound);
  addSound('primary-click', primaryClickSound);
  addSound('win', winSound);
  addSound('bonus-unlock', bonusSoundUnlock);
  addSound('background', backgroundSound);
  addSound('background-bonus', backgroundBonusSound);
  addSound('appear', appearSound);
  addSound('reveal', revealSound);
  addSound('bonus-win', bonusWinSound);

  const [
    coinFront,
    coinFrontFlopped,
    coinBack,
    coinBackFlopped,
    chest1,
    chest2,
    chest3,
    win,
  ] = await Promise.all([
    Promise.all(frontImages.map((s) => Assets.load(s))),
    Promise.all(frontImagesFlopped.map((s) => Assets.load(s))),
    Promise.all(backImages.map((s) => Assets.load(s))),
    Promise.all(backImagesFlopped.map((s) => Assets.load(s))),
    Promise.all(chest1Images.map((s) => Assets.load(s))),
    Promise.all(chest2Images.map((s) => Assets.load(s))),
    Promise.all(chest3Images.map((s) => Assets.load(s))),
    Promise.all(winImages.map((s) => Assets.load(s))),
  ]);

  return {
    bg,
    bgMobile,
    logo,
    winTable,
    coinsBg,
    coinSide,
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
    bonusHeadline,
    chestLabel,
    fog,
    pedestal,
    openAll,
    empty,
    gameRules,
    chest1,
    chest2,
    chest3,
    win,
  };
}
