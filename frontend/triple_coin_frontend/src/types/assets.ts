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

  // chests
  chestClosed: Texture;
  chestOpened: Texture;

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

  // Button
  button: Texture;
  buttonHover: Texture;
  buttonDisabled: Texture;
}
