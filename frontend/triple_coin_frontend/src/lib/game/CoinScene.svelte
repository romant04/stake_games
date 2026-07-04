<script lang="ts">
  import { onMount } from 'svelte';
  import { Application, Container, Sprite } from 'pixi.js';
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
  import { loadAssets } from '$lib/game/pixi/utils/loadAssets';
  import { UIManager } from '$lib/game/pixi/managers/UIManager';
  import { getCurrencySymbol } from '$lib/game/utils/currencySymbols';
  import { AutoplayMenu } from '$lib/game/pixi/ui/AutoplayMenu';
  import { get } from 'svelte/store';

  // ---------------------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------------------
  // TODO: When using turboSpin from autospins it gets bugged - state of the button doesnt reflect the actual state
  let {
    resetAfterBonus,
    handleSpin,
    handleReplay,
  }: {
    resetAfterBonus: () => void;
    handleSpin: () => Promise<void>;
    handleReplay: () => Promise<void>;
  } = $props();

  // ---------------------------------------------------------------------------
  // Internal refs
  // ---------------------------------------------------------------------------

  let wrapper: HTMLDivElement;
  let coinManager: CoinManager;
  let uiManager: UIManager;
  let chestManager: ChestManager;
  let winText: WinText;

  // ---------------------------------------------------------------------------
  // Mount
  // ---------------------------------------------------------------------------
  let activeOrientation: 'landscape' | 'portrait' = 'landscape';
  onMount(() => {
    let cleanup: () => void = () => {};

    (async () => {
      // -- App ------------------------------------------------------------------
      await document.fonts.load('700 28px Merriweather');
      await document.fonts.load('700 24px Merriweather');
      await document.fonts.load('700 20px Merriweather');

      const app = new Application();
      await app.init({
        antialias: true,
        backgroundAlpha: 0,
        autoDensity: true,
        resolution: window.devicePixelRatio,
      });
      wrapper.appendChild(app.canvas);

      const backgroundLayer = new Container();
      const gameLayer = new Container();
      const UILayer = new Container();
      const overlay = new Container();

      app.stage.addChild(backgroundLayer);
      app.stage.addChild(gameLayer);
      app.stage.addChild(UILayer);
      app.stage.addChild(overlay);

      const assets = await loadAssets();

      // -- Background (virtual coords) ------------------------------------------
      const background = new Sprite(assets.bg);
      background.anchor.set(0.5);
      background.position.set(1920 / 2, 1080 / 2);
      background.width = 1920;
      background.height = 1080;
      backgroundLayer.addChild(background);

      const autoplayMenu = new AutoplayMenu(
        assets,
        handleSpin,
        resetAfterAutospins,
        initiateAutoplay,
      );
      overlay.addChild(autoplayMenu.container);

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

      chestManager = new ChestManager(assets, app.ticker, resetAfterBonus);
      chestManager.create();
      app.stage.addChild(chestManager.container);

      winText = new WinText();
      app.stage.addChild(winText.container);

      // -- Turbo store subscription ---------------------------------------------
      // Subscribe once and push the value into managers — no per-frame store reads
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
          uiManager.fog,
          autoplayMenu,
        );

        if (orientation === 'landscape') {
          background.texture = assets.bg;
        } else {
          background.texture = assets.bgMobile;
        }

        if (orientation !== activeOrientation) {
          activeOrientation = orientation;
          uiManager.onOrientationChange(orientation);
        }
      };

      const ro = new ResizeObserver(resize);
      ro.observe(wrapper);
      window.addEventListener('resize', resize);
      resize();

      // -- Cleanup --------------------------------------------------------------
      cleanup = () => {
        unsubTurbo();
        ro.disconnect();
        window.removeEventListener('resize', resize);
        coinManager.destroy();
        chestManager.destroy();
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
  export async function playRound(
    results: string[],
    payout: number,
    bonus: boolean,
  ): Promise<void> {
    uiManager.spinButton.disable();
    uiManager.turboModeButton.disable();
    uiManager.balance.updateBalance();
    await coinManager.spin(results as CoinResult[]);
    if (payout > 0 && !bonus) {
      winText.show(payout, getCurrencySymbol($currency));
    }

    if (!get(bonusGameData) && !get(activeAutoplay)) {
      uiManager.spinButton.enable();
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
    uiManager.spinButton.disable();
    await new Promise<void>((resolve) => setTimeout(resolve, 1000));
    await coinManager.hide();
    await uiManager.showBonusGameUI();
    chestManager.show2();
    await chestManager.show($bonusGameData?.payout ?? 0);
    uiManager.spinButton.enable();
    uiManager.updateSpinButtonText(true);
  }

  export async function hideChests(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 3000));
    chestManager.hide();
    await uiManager.hideBonusGameUI();
    await coinManager.show();
    uiManager.spinButton.enable();
    uiManager.updateSpinButtonText(false);
  }

  export function openChests(): void {
    uiManager.spinButton.disable();
    chestManager.openAll();
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
