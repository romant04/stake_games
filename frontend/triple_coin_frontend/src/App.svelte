<script lang="ts">
  import { onMount } from 'svelte';
  import {
    balance,
    bonusGameData,
    currency,
    gameHistory,
    isPlaying,
    replayMode,
    roundActive,
  } from '$lib/stores/game';
  import { allowedBets } from '$lib/stores/game';
  import Paytable from './components/paytable.svelte';
  import Menu from './components/menu.svelte';
  import { API_MULTIPLIER } from './constants/api';
  import GameHistory from './components/game-history.svelte';
  import CoinScene from '$lib/game/CoinScene.svelte';
  import {
    authenticate,
    endRound,
    getBalance,
    getReplayUrlParams,
    isReplayMode,
    play,
    replay,
  } from 'stake-engine-client';
  import type { Currency } from 'stake-engine';
  import type { Replay } from './types/replay';

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

  async function handleReplay() {
    isPlaying.set(true);

    try {
      const results = $replayMode?.state[0].coins.map((x) => x.side);
      const payout = $replayMode?.state[0].totalWin;
      await coinScene.playRound(results, payout);

      if ($replayMode?.payoutMultiplier > 10) {
        bonusGameData.set({ results, payout });
        await coinScene.showChests();
        return;
      }

      // ONLY AFTER animation finishes
      gameHistory.set([results.join('')]);
      lastWin = payout * API_MULTIPLIER;
    } catch (err) {
      console.error(err);
    } finally {
      isPlaying.set(false);
    }
  }

  async function resetAfterBonus() {
    await coinScene.hideChests();
    gameHistory.set([...$gameHistory, $bonusGameData?.results.join('')]);
    lastWin = $bonusGameData.payout * API_MULTIPLIER;
    bonusGameData.set(null);

    if ($replayMode) {
      return;
    }

    await endRound();
    const updatedBalance = await getBalance();
    balance.set(updatedBalance.balance?.amount);
  }
  async function handleSpin() {
    if ($roundActive) {
      await endRound();
    }

    isPlaying.set(true);

    try {
      const res = await play({
        amount: betAmount,
        mode: 'base',
      });
      balance.set(res.balance?.amount);
      const state = res.round.state as PlayResponseState;

      const results = state[0].coins.map((c) => c.side);

      const payout = res.round.payout / API_MULTIPLIER;
      await coinScene.playRound(results, payout);

      if (state[0].multiplier > 0) {
        bonusGameData.set({ results, payout });
        await coinScene.showChests();
        return;
      }

      // ONLY AFTER animation finishes
      gameHistory.set([...$gameHistory, results.join('')]);
      lastWin = res.round.payout;

      if (state[0].totalWin > 0) {
        await endRound();
      }
      const updatedBalance = await getBalance();
      balance.set(updatedBalance.balance?.amount);
    } catch (err) {
      console.error(err);
    } finally {
      isPlaying.set(false);
      roundActive.set(false);
    }
  }

  onMount(async () => {
    if (isReplayMode()) {
      const params = getReplayUrlParams();
      // Get currency from URL params
      const currencyFromParams = new URLSearchParams(
        window.location.search,
      ).get('currency') as Currency;
      currency.set(currencyFromParams ?? 'USD');
      const r = (await replay({ ...params })) as Replay;
      replayMode.set({ ...r, event: params.event });
      betAmount =
        r.payoutMultiplier !== 0
          ? r.state[0].totalWin / r.payoutMultiplier
          : 10;
      return;
    }

    // Initial Auth to get player data/balance
    try {
      const res = await authenticate();
      roundActive.set(res.round?.active || false);
      currency.set(res.balance?.currency as Currency);
      balance.set(res.balance?.amount || 0);
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
    <CoinScene bind:this={coinScene} {resetAfterBonus} />
  </div>

  <div class="absolute inset-0 z-10 pointer-events-none">
    <div
      class="absolute top-[10%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <h1 class="text-6xl font-bold">Triple Coin Flip</h1>
      {#if $replayMode}
        <span class="text-xl">Replay ID: {$replayMode.event}</span>
      {/if}
    </div>

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
        class="flex justify-center pointer-events-auto items-center fixed top-0 left-0 w-full z-50 h-full bg-[#002a67]/70"
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
      <Menu
        bind:betAmount
        bind:isInfoOpen
        bind:lastWin
        {handleReplay}
        {handleSpin}
      />
    </div>
  </div>
</div>
