import type { Texture } from 'pixi.js';

export interface GameAssets {
  // background
  bg: Texture;
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
  chestClosed: Texture;
  chestOpened1: Texture;
  chestOpened2: Texture;
  chestOpened3: Texture;
  chestOpened4: Texture;
  chestLabel: Texture;
  pedestal: Texture;
  fog: Texture;
  bonusHeadline: Texture;
  openAll: Texture;
}
