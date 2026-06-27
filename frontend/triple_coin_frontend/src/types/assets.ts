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
}
