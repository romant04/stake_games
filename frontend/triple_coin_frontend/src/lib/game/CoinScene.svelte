<script lang="ts">
  import { onMount } from 'svelte';
  import { Application, Assets, Container, Sprite } from 'pixi.js';
  import {
    turboMode,
    bonusGameData,
    currency,
    activeAutoplay,
    autoplayShouldStop,
  } from '$lib/stores/game';

  import { CoinManager } from '$lib/game/pixi/managers/CoinManager';
  import { ChestManager } from '$lib/game/pixi/managers/ChestManager';
  import { WinText } from '$lib/game/pixi/managers/WinText';
  import { fitStageToScreen } from '$lib/game/pixi/utils/fitStage';
  import type { CoinResult } from '$lib/game/pixi/objects/Coin';
  import {
    loadCoreAssets,
    loadBonusAssets,
  } from '$lib/game/pixi/utils/loadAssets';
  import { UIManager } from '$lib/game/pixi/managers/UIManager';
  import { getCurrencySymbol } from '$lib/game/utils/currencySymbols';
  import { AutoplayMenu } from '$lib/game/pixi/ui/AutoplayMenu';
  import { get } from 'svelte/store';
  import { InfoOverlay } from '$lib/game/pixi/ui/InfoOverlay';
  import type { GameAssets } from '../../types/assets';
  import { WinScreen } from '$lib/game/pixi/ui/WinScreen';
  import { sound } from '@pixi/sound';
  import { SFX_VOLUME } from '$lib/game/pixi/constants/game';
  import { UiGradient } from '$lib/game/pixi/ui/UiGradient';

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------
  let {
    resetAfterBonus,
    handleSpin,
    handleReplay,
    loading = $bindable(true),
    bonusLoading = $bindable(true),
  }: {
    resetAfterBonus: () => void;
    handleSpin: () => Promise<void>;
    handleReplay: () => Promise<void>;
    loading?: boolean;
    bonusLoading?: boolean;
  } = $props();

  // ---------------------------------------------------------------------------
  // Internal refs
  // ---------------------------------------------------------------------------

  let wrapper: HTMLDivElement;
  let coinManager: CoinManager;
  let uiManager: UIManager;
  // ChestManager and WinScreen both need bonus-only textures (chest1/2/3, win)
  // that assets.win/chest* only get once loadBonusAssets() resolves — see
  // loadBonusAssets().then(...) below. Neither exists until then.
  let chestManager: ChestManager | undefined;
  let winScreen: WinScreen | undefined;
  let winText: WinText;
  let autoplayMenu: AutoplayMenu;
  let uiGradient: UiGradient;

  // Populated in two steps: core fields first, chest1/chest2/chest3/win merged in later.
  // Cast is safe because every consumer of the bonus-only fields waits on bonusAssetsReady.
  let assets: GameAssets;
  let overlay: Container;

  // Resolves once bonus assets are loaded AND chestManager has been constructed.
  // showChests() awaits this so it never touches chestManager before it exists.
  let bonusAssetsReady: Promise<void>;

  // ---------------------------------------------------------------------------
  // Mount
  // ---------------------------------------------------------------------------
  let activeOrientation: 'landscape' | 'portrait' = 'landscape';
  onMount(() => {
    let cleanup: () => void = () => {};

    (async () => {
      // -- App ------------------------------------------------------------------
      await Assets.load({
        alias: 'Merriweather',
        src: 'https://fonts.gstatic.com/s/merriweather/v30/u-4n0qyriQwlOrhSvowK_l52xwNZWMf6hPvhPQ.woff2', // Direct woff2 link
        data: {
          family: 'Merriweather',
        },
      });

      const app = new Application();
      await app.init({
        antialias: false,
        backgroundAlpha: 0,
        autoDensity: true,
        resolution: window.devicePixelRatio,
      });
      wrapper.appendChild(app.canvas);
      app.stage.sortableChildren = true;

      // Only what's needed to render the scene and take the first spin.
      // Bonus (chest/win) assets stream in separately, below.
      assets = (await loadCoreAssets()) as GameAssets;
      sound.volumeAll = 1.5;
      sound.play('background', { loop: true, volume: 1 });

      const backgroundLayer = new Container();
      const gameLayer = new Container();
      const UILayer = new Container();
      overlay = new Container();

      // Explicit zIndex so stacking order is correct regardless of when each
      // layer/container is actually added to the stage (chestManager and
      // winScreen get added later, asynchronously, once bonus assets arrive).
      backgroundLayer.zIndex = 0;
      gameLayer.zIndex = 1;
      // chestManager.container gets zIndex 2 when it's created, below
      UILayer.zIndex = 3;
      overlay.zIndex = 4;

      app.stage.addChild(backgroundLayer);
      app.stage.addChild(gameLayer);
      app.stage.addChild(UILayer);

      uiGradient = new UiGradient();
      UILayer.addChild(uiGradient.container);

      // -- Managers -------------------------------------------------------------
      uiManager = new UIManager(
        assets,
        app.ticker,
        handleSpin,
        handleReplay,
        () => {
          autoplayMenu.container.visible = true;
        },
      );
      UILayer.addChild(uiManager.container);

      coinManager = new CoinManager(assets, app.ticker);
      coinManager.create();
      gameLayer.addChild(coinManager.container);

      winText = new WinText();
      app.stage.addChild(winText.container);

      // Add overlays as last
      app.stage.addChild(overlay);

      // -- Background (virtual coords) ------------------------------------------
      const background = new Sprite(assets.bg);
      background.anchor.set(0.5);
      background.position.set(1920 / 2, 1080 / 2);
      background.width = 1920;
      background.height = 1080;
      backgroundLayer.addChild(background);

      autoplayMenu = new AutoplayMenu(
        assets,
        handleSpin,
        resetAfterAutospins,
        initiateAutoplay,
      );
      overlay.addChild(autoplayMenu.container);
      const infoOverlay = new InfoOverlay(assets);
      overlay.addChild(infoOverlay.container);
      // winScreen is constructed later, once bonus assets (assets.win) arrive —
      // see the loadBonusAssets().then(...) block below.

      // -- Turbo store subscription ---------------------------------------------
      const unsubTurbo = turboMode.subscribe((val) => {
        coinManager?.setTurbo(val);
      });

      // -- Resize — only resize the renderer; stage scale handles the rest ------
      const resize = () => {
        if (!wrapper) return;
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;
        app.renderer.resize(w, h);

        const orientation = w > h ? 'landscape' : 'portrait';

        fitStageToScreen(
          app,
          orientation,
          background,
          chestManager?.fog, // undefined until bonus assets arrive — fitStageToScreen must tolerate this
          autoplayMenu,
          infoOverlay,
          winScreen, // also undefined until bonus assets arrive — same requirement
          uiGradient,
        );

        if (orientation === 'landscape') {
          background.texture = assets.bg;
        } else {
          background.texture = assets.bgMobile;
        }

        if (orientation !== activeOrientation) {
          activeOrientation = orientation;
          uiManager.onOrientationChange(orientation);
          coinManager.onOrientationChange(orientation);
          infoOverlay.onOrientationChange(orientation);
          chestManager?.onOrientationChange();
          winScreen?.onOrientationChange(orientation);
          autoplayMenu.onOrientationChange(orientation);
        }
      };

      const ro = new ResizeObserver(resize);
      ro.observe(wrapper);
      window.addEventListener('resize', resize);
      resize(); // scene is playable now — first spin doesn't depend on bonus assets
      loading = false;

      // -- Stream in bonus-only assets in the background -------------------------
      // Fires immediately after core assets resolve, but isn't awaited here, so
      // it never blocks the first render or the first spin.
      bonusAssetsReady = loadBonusAssets().then((bonus) => {
        Object.assign(assets, bonus);

        chestManager = new ChestManager(assets, app.ticker, resetAfterBonus);
        chestManager.create();
        chestManager.container.zIndex = 2; // sits between gameLayer(1) and UILayer(3)
        app.stage.addChild(chestManager.container);
        chestManager.onOrientationChange();

        // WinScreen also needs assets.win (bonus-only), so it's built here too.
        winScreen = new WinScreen(assets, app.ticker, 0);
        overlay.addChild(winScreen.container); // overlay already has zIndex 4
        winScreen.onOrientationChange(activeOrientation);

        resize(); // re-run once so fog/chest/win layout gets sized correctly
        bonusLoading = false;
      });

      // -- Cleanup --------------------------------------------------------------
      cleanup = () => {
        unsubTurbo();
        ro.disconnect();
        window.removeEventListener('resize', resize);
        coinManager.destroy();
        chestManager?.destroy();
        app.destroy(true);
      };
    })();

    return () => cleanup();
  });

  function initiateAutoplay() {
    if (
      get(turboMode) === true &&
      uiManager.turboModeButton.state !== 'active'
    ) {
      uiManager.turboModeButton.toggleActive();
    }

    uiManager.changeAutoplayButtonState(true);
  }

  // ---------------------------------------------------------------------------
  // Exported API (called by parent)
  // ---------------------------------------------------------------------------
  export function startSpin() {
    uiManager.turboModeButton.disable();
    uiManager.balance.updateBalance(); // TODO: Will this work??
    coinManager.startSpin();
  }
  export async function stopSpin(
    results: string[],
    payout: number,
    bonus: boolean,
  ): Promise<void> {
    // uiManager.balance.updateBalance(); -> uncomment if the one from startSpin doesn't work
    await coinManager.stopSpin(results as CoinResult[]);

    if (payout > 0 && !bonus) {
      winText.show(payout, getCurrencySymbol($currency));
      sound.play('win', { volume: SFX_VOLUME });
    }

    if (results.filter((r) => r === 'S').length >= 3) {
      sound.play('bonus-unlock', { volume: SFX_VOLUME });
    }

    uiManager.turboModeButton.enable();
  }
  export function rerenderHistory() {
    uiManager.gameHistory.update();
    uiManager.balance.updateBalance();
    uiManager.lastWin.updateLastWin();

    if (get(activeAutoplay) === null) {
      uiManager.changeAutoplayButtonState(false);
    }
    if (get(autoplayShouldStop)) {
      uiManager.changeAutoplayButtonState(false);
      uiManager.spinButton.enable();
    }
  }

  export function resetAfterAutospins() {
    uiManager.spinButton.enable();
    uiManager.turboModeButton.enable();
    uiManager.changeAutoplayButtonState(false);
  }

  export async function showChests(): Promise<void> {
    // Guarantees chestManager exists even if a player somehow reaches a bonus
    // round before bonus assets finish streaming in. In practice this resolves
    // instantly, since it starts loading right after core assets and a player
    // needs at least one spin (plus payout resolution) before triggering bonus.
    await bonusAssetsReady;

    uiManager.spinButton.disable();
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    sound.volume('background', 0.3);
    sound.play('background-bonus', { volume: 1, loop: true });
    await coinManager.hide();
    await uiManager.showBonusGameUI();
    await chestManager!.showFog();
    chestManager!.show2();
    await chestManager!.show($bonusGameData?.payout ?? 0);
    uiManager.spinButton.enable();
    uiManager.updateSpinButtonText(true);
  }

  export async function hideChests(): Promise<void> {
    await bonusAssetsReady; // guarantees winScreen/chestManager exist

    uiManager.spinButton.disable();
    winScreen!.setWinLabel($bonusGameData?.payout ?? 0);
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    void winScreen!.show();
    await new Promise<void>((resolve) => setTimeout(resolve, 2500));
    await winScreen!.hide();
    await chestManager!.hide();
    sound.stop('background-bonus');
    sound.volume('background', 1);
    await uiManager.hideBonusGameUI();
    await chestManager!.hideFog();
    await coinManager.show();
    uiManager.updateSpinButtonText(false);
    uiManager.spinButton.enable();
  }

  export function openChests(): void {
    uiManager.spinButton.disable();
    chestManager!.openAll();
  }

  export function notEnoughBalance(): void {
    winText.showNotEnoughBalance();
  }
</script>

<div bind:this={wrapper} class="pixi-wrapper"></div>

<style>
  .pixi-wrapper {
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }
</style>
