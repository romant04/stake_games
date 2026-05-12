<script lang="ts">
  import { onMount } from 'svelte';
  import { initClient } from '$lib/engine/client';
  import { setupEventListeners } from '$lib/engine/events';
  import { authenticate, play, endRound } from '$lib/engine/actions';
  import { currency, isPlaying, roundActive } from '$lib/stores/game';
  import { fly, fade } from 'svelte/transition';
  import { allowedBets } from '$lib/stores/game';
  import Paytable from './components/paytable.svelte';
  import Menu from './components/menu.svelte';
  import front from './assets/game/front.png';
  import back from './assets/game/back.png';
  import side from './assets/game/side.png';
  import bg from './assets/bg.png';
  import { API_MULTIPLIER } from './constants/api';

  function textToImageMapper(text: string) {
    return {
      H: front,
      T: back,
      S: side,
    }[text];
  }
  const frames = [front, side, back];

  let coinResults = $state([
    { index: 0, side: 'H' },
    { index: 1, side: 'H' },
    { index: 2, side: 'H' },
  ]);

  let firstCoin = $state<string>(front);
  let secondCoin = $state<string>(front);
  let thirdCoin = $state<string>(front);

  let betAmount = $state(10);
  let payout = $state(null);

  $effect(() => {
    if (payout === null) return;

    const timeout = setTimeout(() => {
      payout = null;
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  });

  interface PlayResponseState0 {
    coins: { index: number; side: 'H' | 'T' | 'S' }[];
    index: number;
    multiplier: number;
    numberRolled: number;
    totalWin: number;
    type: string;
  }
  interface PlayResponseState1 {
    amount: number;
    index: number;
    type: string;
  }

  type PlayResponseState = [PlayResponseState0, PlayResponseState1];

  function spinCoin(
    assign: (value: string) => void,
    result: string,
    duration: number,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      let elapsed = 0;
      let i = 0;

      const interval = setInterval(() => {
        if (elapsed >= duration) {
          clearInterval(interval);
          assign(result);
          resolve();
          return;
        }

        assign(frames[i % frames.length]);
        i++;

        elapsed += 100;
      }, 100);
    });
  }

  async function spinCoins() {
    await Promise.all(
      [firstCoin, secondCoin, thirdCoin].map((_, i) =>
        spinCoin(
          (v) => {
            if (i === 0) firstCoin = v;
            else if (i === 1) secondCoin = v;
            else thirdCoin = v;
          },
          textToImageMapper(coinResults[i].side),
          1000 + i * 1000,
        ),
      ),
    );
  }

  async function handleSpin() {
    if ($roundActive) {
      await endRound(); // For weird edge case where player exits mid-game
    }
    isPlaying.set(true);

    const start = Date.now();

    try {
      const apiBetAmount = betAmount * API_MULTIPLIER;
      const res = await play(apiBetAmount, 'base');

      console.log('Play response:', res);

      if (res.round.state) {
        const state = res.round.state as PlayResponseState;
        coinResults = state[0].coins;

        await spinCoins();
        payout = res.round.payout / API_MULTIPLIER;
        if (state[0].totalWin > 0) {
          await endRound();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      const elapsed = Date.now() - start;
      const minDuration = 500;

      if (elapsed < minDuration) {
        await new Promise((r) => setTimeout(r, minDuration - elapsed));
      }

      isPlaying.set(false);
    }
  }

  onMount(async () => {
    // Initialize SDK and Listeners
    initClient();
    setupEventListeners();

    // Initial Auth to get player data/balance
    try {
      const res = await authenticate();
      $allowedBets = res.config.betLevels.map(
        (level) => level / API_MULTIPLIER,
      );
    } catch (err) {
      alert('Auth failed: ' + err);
    }
  });
</script>

<div class="flex flex-col items-center">
  <img alt="background" class="bg" src={bg} />
  <div
    class="max-[1100px]:hidden absolute top-1/2 -translate-y-1/2 lg:left-2 xl:left-12 2xl:left-36"
  >
    <Paytable />
  </div>

  <h1 class="text-6xl font-bold mt-32">Triple Coin Flip</h1>

  <div class="coin-row">
    {#if payout !== null}
      <span
        class="info"
        style={payout > 0 ? 'color: gold;' : 'color: crimson;'}
        in:fly={{ y: 40, duration: 400 }}
        out:fade={{ duration: 200 }}
      >
        +{payout}
        {$currency}
      </span>
    {/if}
    <div class="coin">
      <img alt="" src={firstCoin} />
    </div>
    <div class="coin">
      <img alt="" src={secondCoin} />
    </div>
    <div class="coin">
      <img alt="" src={thirdCoin} />
    </div>
  </div>

  <div class="absolute z-40 bottom-5 md:bottom-10 w-[95%] lg:w-3/4">
    <Menu bind:betAmount {handleSpin} />
  </div>
</div>

<style>
  .coin-row {
    display: flex;
    gap: 40px;
    justify-content: center;
    margin: 20px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .coin {
    width: 120px;
    height: 120px;
  }
  .coin > img {
    width: 100%;
    height: 100%;
  }
  .flipping {
    animation: spin 0.5s infinite;
  }
  @keyframes spin {
    from {
      transform: rotateY(0);
    }
    to {
      transform: rotateY(360deg);
    }
  }
</style>
