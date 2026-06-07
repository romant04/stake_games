<script lang="ts">
  import { onMount } from 'svelte';

  import { Application, Assets, Sprite } from 'pixi.js';

  import bg from '../../assets/bg.png';
  import front from '../../assets/game/front.png';
  import back from '../../assets/game/back.png';
  import side from '../../assets/game/side.png';
  import chestClosed from '../../assets/game/chest_closed.png';
  import chestOpened from '../../assets/game/chest_opened.png';
  import { CoinManager } from '$lib/game/pixi/CoinManager';
  import { WinText } from '$lib/game/pixi/WinText';
  import { Chest } from '$lib/game/pixi/Chest';
  import { Coin } from '$lib/game/pixi/Coin';
  import { ChestManager } from '$lib/game/pixi/ChestManager';

  let { resetAfterBonus }: { resetAfterBonus: () => void } = $props();

  let wrapper: HTMLDivElement;
  let manager: CoinManager;
  let chestManager: ChestManager;
  let winText: WinText;

  let app: Application;

  onMount(() => {
    // 1. Create a placeholder for your cleanup function
    let cleanup: () => void = () => {};

    // 2. Put your exact code inside this async block
    (async () => {
      //
      // CREATE PIXI APPLICATION
      //
      app = new Application();

      await app.init({
        antialias: true,
        backgroundAlpha: 0,
      });

      wrapper.appendChild(app.canvas);

      //
      // LOAD TEXTURES
      //
      const bgTexture = await Assets.load(bg);
      const frontTexture = await Assets.load(front);
      const backTexture = await Assets.load(back);
      const sideTexture = await Assets.load(side);
      const chestClosedTexture = await Assets.load(chestClosed);
      const chestOpenedTexture = await Assets.load(chestOpened);

      //
      // BACKGROUND
      //
      const background = new Sprite(bgTexture);
      background.anchor.set(0.5);
      background.width = app.screen.width;
      background.height = app.screen.height;
      app.stage.addChild(background);

      chestManager = new ChestManager(chestClosedTexture, chestOpenedTexture);
      chestManager.create(
        app.stage,
        wrapper.clientWidth,
        wrapper.clientHeight,
        resetAfterBonus,
      );

      manager = new CoinManager(
        frontTexture,
        backTexture,
        sideTexture,
        app.ticker,
      );
      manager.create(app.stage, wrapper.clientWidth, wrapper.clientHeight);

      winText = new WinText();
      app.stage.addChild(winText.container);

      //
      // HANDLE RESIZE
      //
      const resize = () => {
        if (!app || !wrapper) return;

        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;

        app.renderer.resize(w, h);
        background.x = w / 2;
        background.y = h / 2;

        background.width = w;
        background.height = h;

        manager.setPositions(w, h);
        chestManager.setPositions(w, h);
      };

      const ro = new ResizeObserver(() => {
        resize();
      });

      ro.observe(wrapper);
      window.addEventListener('resize', resize);
      resize();

      // 3. Assign your cleanup logic here
      cleanup = () => {
        ro.disconnect();
        window.removeEventListener('resize', resize);
        app.destroy(true);
      };
    })();

    // 4. Return a synchronous function to Svelte
    return () => cleanup();
  });

  export async function playRound(
    results: string[],
    payout: number,
    bonus: boolean,
  ) {
    await manager.spin(results);
    if (payout > 0 && !bonus) {
      winText.show(app, payout);
    }
  }

  export async function showChests(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        manager.hide();
        chestManager.show();
        resolve();
      }, 1000);
    });
  }

  export async function hideChests() {
    setTimeout(() => {
      chestManager.hide();
      manager.show();
    }, 1000);
  }

  export async function openChests() {
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
