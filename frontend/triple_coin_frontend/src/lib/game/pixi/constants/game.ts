/** Diameter coins are displayed at in virtual pixels */
export const COIN_SIZE = 200;

/** Horizontal gap between coin centres */
export const COIN_SPACING = 240;

/** Diameter chests are displayed at in virtual pixels */
export const CHEST_SIZE = 150;

/** Horizontal gap between chest centres */
export const CHEST_SPACING = 180;

// ---------------------------------------------------------------------------
// Coin spin timing (all values in milliseconds unless noted)
// ---------------------------------------------------------------------------
export const SPIN_SPEED_NORMAL = 16;
export const SPIN_SPEED_TURBO = 24;

export const SPIN_DURATION_NORMAL = 1600;
export const SPIN_DURATION_TURBO = 600;

export const STOP_DELAY_NORMAL = 750;
export const STOP_DELAY_TURBO = 400;

/** Deceleration factor per frame — lower = faster stop */
export const DECEL_NORMAL = 0.97;
export const DECEL_TURBO = 0.92;

export const MIN_STOP_SPEED_NORMAL = 5;
export const MIN_STOP_SPEED_TURBO = 10;

/** Duration of the jackpot glow display in ms */
export const GLOW_DURATION_NORMAL = 3500;
export const GLOW_DURATION_TURBO = 1500;

// ---------------------------------------------------------------------------
// Chest animation
// ---------------------------------------------------------------------------
/** Delay between each chest appearing in ms */
export const CHEST_APPEAR_STAGGER = 500;

/** Delay between auto-opening remaining chests in ms */
export const CHEST_OPEN_STAGGER = 1000;

/** Frames for the appear scale-in animation */
export const CHEST_APPEAR_FRAMES = 20;

export const MAX_HISTORY = 5;
