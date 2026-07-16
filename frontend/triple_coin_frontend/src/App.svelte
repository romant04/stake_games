<script lang="ts">
  import { onMount } from 'svelte';
  import {
    activeAutoplay,
    balance,
    betAmount,
    bonusGameData,
    currency,
    gameHistory,
    isBonusGameActive,
    isPlaying,
    lastWin,
    replayMode,
    roundActive,
    turboMode,
  } from '$lib/stores/game';
  import { allowedBets } from '$lib/stores/game';
  import { API_MULTIPLIER } from './constants/api';
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
  import { startAutoplay } from './utils/startAutoplay';
  import { wait } from '$lib/game/pixi/utils/wait';
  import loadingLogo from './assets/loading_logo.webp';

  const BONUS_GAME_THRESHOLD = 10;

  let coinScene: CoinScene;
  let loading = $state(true);

  let chestsVisible = $state(false);
  let chestsOpening = $state(false);

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
    if ($bonusGameData && chestsVisible && !chestsOpening) {
      chestsOpening = true;
      await coinScene.openChests();
      return;
    }

    isPlaying.set(true);
    coinScene.startSpin();

    try {
      const results = $replayMode?.state[0].coins.map((x) => x.side);
      const payout = $replayMode?.payoutMultiplier * $betAmount;
      await wait($turboMode ? 500 : 1000);
      await coinScene.stopSpin(
        results,
        payout,
        $replayMode?.payoutMultiplier >= BONUS_GAME_THRESHOLD,
      );

      if ($replayMode?.payoutMultiplier >= BONUS_GAME_THRESHOLD) {
        bonusGameData.set({ results, payout });
        await coinScene.showChests();
        chestsVisible = true;
        return;
      }

      // ONLY AFTER animation finishes
      gameHistory.set([results.join('')]);
      $lastWin = payout * API_MULTIPLIER;
      coinScene.rerenderHistory();
    } catch (err) {
      console.error(err);
    } finally {
      isPlaying.set(false);
    }
  }

  async function resetAfterBonus() {
    await coinScene.hideChests();
    gameHistory.set([...$gameHistory, $bonusGameData?.results.join('')]);
    $lastWin = $bonusGameData.payout * API_MULTIPLIER;
    bonusGameData.set(null);

    chestsVisible = false;
    chestsOpening = false;
    $isBonusGameActive = false;
    if ($replayMode) {
      coinScene.rerenderHistory();
      return;
    }

    await endRound();
    const updatedBalance = await getBalance();
    balance.set(updatedBalance.balance?.amount);
    coinScene.rerenderHistory();

    if ($activeAutoplay && $activeAutoplay.spins !== 0) {
      await startAutoplay(handleSpin, coinScene.resetAfterAutospins);
    }
  }
  async function handleSpin() {
    if ($bonusGameData && chestsVisible && !chestsOpening) {
      chestsOpening = true;
      await coinScene.openChests();
      return;
    }

    if ($isPlaying || chestsOpening) return;

    if ($roundActive) {
      await endRound();
    }

    if ($betAmount > $balance / API_MULTIPLIER) {
      coinScene.notEnoughBalance();
      return;
    }

    isPlaying.set(true);
    balance.set($balance - $betAmount * API_MULTIPLIER);
    coinScene.startSpin();

    try {
      const [res] = await Promise.all([
        play({
          amount: $betAmount,
          mode: 'base',
        }),
        wait($turboMode ? 400 : 800),
      ]);
      const state = res.round.state as PlayResponseState;

      const results = state[0].coins.map((c) => c.side);

      const payout = res.round.payout / API_MULTIPLIER;
      await coinScene.stopSpin(
        results,
        payout,
        state[0].multiplier >= BONUS_GAME_THRESHOLD,
      );

      if (state[0].multiplier >= BONUS_GAME_THRESHOLD) {
        bonusGameData.set({ results, payout });
        await coinScene.showChests();
        chestsVisible = true;
        $isBonusGameActive = true;
        return;
      }

      // ONLY AFTER animation finishes
      gameHistory.set([...$gameHistory, results.join('')]);
      $lastWin = res.round.payout;

      if (state[0].totalWin > 0) {
        await endRound();
      }
      const updatedBalance = await getBalance();
      balance.set(updatedBalance.balance?.amount);
      coinScene.rerenderHistory();
    } catch (err) {
      console.error(err);
    } finally {
      isPlaying.set(false);
      roundActive.set(false);
    }
  }

  let progress = $state(0);
  onMount(() => {
    const interval = setInterval(() => {
      const max = loading ? 99 : 100;

      const increment = loading
        ? progress < 50
          ? Math.random() * 10
          : progress < 80
            ? Math.random() * 5
            : progress < 95
              ? Math.random() * 3
              : Math.random() * 2
        : 50; // Constant speed to 100%

      progress = Math.min(progress + increment, max);

      if (!loading && progress >= 100) {
        clearInterval(interval);
        // Hide loader here if needed
      }
    }, 100);

    (async () => {
      if (isReplayMode()) {
        const params = getReplayUrlParams();

        const extraParams = new URLSearchParams(window.location.search);
        const currencyFromParams = extraParams.get('currency') as Currency;

        $betAmount = Number(extraParams.get('amount')) / API_MULTIPLIER;
        currency.set(currencyFromParams ?? 'USD');

        const r = (await replay({ ...params })) as Replay;
        replayMode.set({ ...r, event: params.event });

        return;
      }

      try {
        const res = await authenticate();

        roundActive.set(res.round?.active || false);
        currency.set(res.balance?.currency as Currency);
        balance.set(res.balance?.amount || 0);

        const betLevels = [0.5, 1, 2, 5, 10, 20, 30, 40, 50];

        $allowedBets = res.config.betLevels
          .map((level) => level / API_MULTIPLIER)
          .filter(
            (x) => betLevels.includes(x) || x > betLevels[betLevels.length - 1],
          );
      } catch (err) {
        alert('Auth failed: ' + err);
      }
    })();

    return () => {
      clearInterval(interval);
    };
  });
</script>

<div class="relative w-screen h-dvh overflow-hidden">
  {#if loading || progress < 100}
    <div
      class="absolute inset-0 flex flex-col gap-8 items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <img src={loadingLogo} alt="" class="w-64 h-64" />
      <div class="flex flex-col gap-4 items-center">
        <div class="loader">
          <div class="fill" style={`transform: scaleX(${progress / 100})`} />
        </div>
        <div class="text-sm uppercase text-gray-300">loading</div>
      </div>
    </div>
  {/if}
  <div class="absolute inset-0">
    <CoinScene
      bind:loading
      bind:this={coinScene}
      {handleReplay}
      {handleSpin}
      {resetAfterBonus}
    />
  </div>
</div>

<style>
  .loader {
    width: 400px;
    height: 7px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.12);
  }

  .fill {
    width: 100%;
    height: 100%;
    transform-origin: left;
    transition: transform 120ms linear;
    background: linear-gradient(90deg, #ffcc33, #ffd966, #ffcc33);
  }
</style>
