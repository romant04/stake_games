/**
 * Virtual canvas — all game objects are positioned in this coordinate space.
 * The entire stage is scaled uniformly to fit the real screen.
 * Nothing else in the game should reference real screen pixels directly.
 */
export const VIRTUAL_WIDTH = 1920;
export const VIRTUAL_HEIGHT = 1080;

/** Horizontal centre of the virtual canvas */
export const CX = VIRTUAL_WIDTH / 2;
/** Vertical centre of the virtual canvas */
export const CY = VIRTUAL_HEIGHT / 2;
