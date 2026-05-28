<script lang="ts">
  import { onMount } from 'svelte';
  import { initClient } from '$lib/engine/client';
  import { setupEventListeners } from '$lib/engine/events';
  import { authenticate, play, endRound } from '$lib/engine/actions';
  import {
    currency,
    gameHistory,
    isPlaying,
    roundActive,
  } from '$lib/stores/game';
  import { allowedBets } from '$lib/stores/game';
  import Paytable from './components/paytable.svelte';
  import Menu from './components/menu.svelte';
  import { API_MULTIPLIER } from './constants/api';
  import GameHistory from './components/game-history.svelte';
  import CoinScene from '$lib/game/CoinScene.svelte';

  let isInfoOpen = $state<boolean>(false);

  let betAmount = $state(10);
  let lastWin = $state(0);
  let coinScene: CoinScene;

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

  async function handleSpin() {
    if ($roundActive) {
      await endRound();
    }

    isPlaying.set(true);

    try {
      const apiBetAmount = betAmount * API_MULTIPLIER;
      const res = await play(apiBetAmount, 'base');
      const state = res.round.state as PlayResponseState;

      const results = state[0].coins.map((c) => c.side);

      const payout = res.round.payout / API_MULTIPLIER;
      await coinScene.playRound(results, payout);

      // ONLY AFTER animation finishes
      gameHistory.set([...$gameHistory, results.join('')]);
      lastWin = res.round.payout;

      if (state[0].totalWin > 0) {
        await endRound();
      }
    } catch (err) {
      console.error(err);
    } finally {
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
      const betLevels = [0.5, 1, 2, 5, 10, 20, 30, 40, 50]; // Desired bet levels
      $allowedBets = res.config.betLevels
        .map((level) => level / API_MULTIPLIER)
        .filter(
          (x) => betLevels.includes(x) || x > betLevels[betLevels.length - 1],
        );
    } catch (err) {
      alert('Auth failed: ' + err);
    }
  });
</script>

<div class="relative w-screen h-dvh overflow-hidden">
  <div class="absolute inset-0">
    <CoinScene bind:this={coinScene} />
  </div>

  <div class="absolute inset-0 z-10">
    <h1 class="absolute top-[10%] left-1/2 -translate-x-1/2 text-6xl font-bold">
      Triple Coin Flip
    </h1>

    <div
      class="max-[1100px]:hidden absolute top-1/2 -translate-y-1/2 lg:left-2 xl:left-12 2xl:left-36"
    >
      <Paytable />
    </div>

    <div class="pointer-events-auto absolute top-10 right-10">
      <GameHistory />
    </div>

    {#if isInfoOpen}
      <button
        class="flex justify-center items-center fixed top-0 left-0 w-full z-50 h-full bg-[#002a67]/70"
        onclick={() => {
          isInfoOpen = false;
        }}
      >
        <div class="p-10 min-w-1/2 bg-[#002a67]/90">
          <p class="text-3xl">
            Triple Coin Flip | <span class="text-gray-200">INFO</span>
          </p>
          <div class="py-6">
            <Paytable />
          </div>
          <p class="text-sm text-gray-300 mt-10">
            <span class="text-white">Details</span>
            <br />
            RTP: 95%
          </p>
        </div>
      </button>
    {/if}

    <div
      class="pointer-events-auto absolute z-40 bottom-5 left-1/2 -translate-x-1/2 md:bottom-10 w-[95%] 2xl:w-3/4"
    >
      <Menu bind:betAmount bind:isInfoOpen bind:lastWin {handleSpin} />
    </div>
  </div>
</div>
