import type { Texture } from 'pixi.js';

export interface GameAssets {
  // background
  bg: Texture;
  bgMobile: Texture;
  coinsBg: Texture;

  // Logo
  logo: Texture;

  // Win table
  winTable: Texture;

  // coins
  coinFront: Texture[];
  coinFrontFlopped: Texture[];
  coinBack: Texture[];
  coinBackFlopped: Texture[];
  coinSide: Texture;

  // Spin button
  spin: Texture;
  spinHover: Texture;
  spinDisabled: Texture;
  spinText: Texture;

  // History coins
  front: Texture;
  side: Texture;
  back: Texture;

  // Toggle button
  toggle: Texture;
  toggleHover: Texture;
  toggleDisabled: Texture;
  toggleActive: Texture;
  toggleActiveHover: Texture;

  // Icons
  bolt: Texture;
  boltFilled: Texture;
  plus: Texture;
  minus: Texture;
  hamburger: Texture;
  close: Texture;
  autospin: Texture;
  pause: Texture;
  sound: Texture;
  mute: Texture;
  info: Texture;

  // Button
  button: Texture;
  buttonHover: Texture;
  buttonDisabled: Texture;

  // Autospin modal
  autospinModalBg: Texture;
  checkbox: Texture;
  checkboxHover: Texture;
  checkboxActive: Texture;
  checkboxActiveHover: Texture;
  selectionButton: Texture;
  selectionButtonHover: Texture;
  selectionButtonActive: Texture;
  selectionButtonActiveHover: Texture;
  startAutospin: Texture;
  startAutospinHover: Texture;

  // Bonus game assets
  chest1: Texture[];
  chest2: Texture[];
  chest3: Texture[];

  chestLabel: Texture;
  pedestal: Texture;
  fog: Texture;
  bonusHeadline: Texture;
  openAll: Texture;

  // Info layout
  empty: Texture;
  gameRules: Texture;

  // Win screen
  win: Texture[];
}
