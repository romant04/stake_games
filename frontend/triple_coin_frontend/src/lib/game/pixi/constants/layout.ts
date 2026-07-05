/**
 * Virtual canvas — all game objects are positioned in this coordinate space.
 * The entire stage is scaled uniformly to fit the real screen.
 * Nothing else in the game should reference real screen pixels directly.
 */
export const VIRTUAL_SIZES = {
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
};

export class Layout {
  private static orientation: 'landscape' | 'portrait' = 'landscape';

  static get VIRTUAL_WIDTH(): number {
    return VIRTUAL_SIZES[this.orientation].width;
  }

  static get VIRTUAL_HEIGHT(): number {
    return VIRTUAL_SIZES[this.orientation].height;
  }

  static get CX(): number {
    return Layout.VIRTUAL_WIDTH / 2;
  }

  static get CY(): number {
    return Layout.VIRTUAL_HEIGHT / 2;
  }

  public static setOrientation(orientation: 'landscape' | 'portrait'): void {
    Layout.orientation = orientation;
  }
  public static getOrientation(): 'landscape' | 'portrait' {
    return Layout.orientation;
  }
}
