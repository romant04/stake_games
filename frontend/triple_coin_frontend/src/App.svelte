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
  import AutoplayModal from './components/autoplay-modal.svelte';
  import { startAutoplay } from './utils/startAutoplay';
  import InfoModal from './components/info-modal.svelte';

  const BONUS_GAME_THRESHOLD = 10;

  let coinScene: CoinScene;
  let ready = $state(false);

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

    try {
      const results = $replayMode?.state[0].coins.map((x) => x.side);
      const payout = $replayMode?.payoutMultiplier * $betAmount;
      await coinScene.playRound(
        results,
        payout,
        $replayMode?.payoutMultiplier >= BONUS_GAME_THRESHOLD,
      );

      if ($replayMode?.payoutMultiplier >= BONUS_GAME_THRESHOLD) {
        bonusGameData.set({ results, payout });
        await coinScene.showChests();
        setTimeout(() => {
          chestsVisible = true;
        }, 1100);
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
      return;
    }

    await endRound();
    const updatedBalance = await getBalance();
    balance.set(updatedBalance.balance?.amount);

    if ($activeAutoplay?.spins !== 0) {
      await startAutoplay(handleSpin);
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

    isPlaying.set(true);

    try {
      const res = await play({
        amount: $betAmount,
        mode: 'base',
      });
      balance.set(res.balance?.amount);
      const state = res.round.state as PlayResponseState;

      const results = state[0].coins.map((c) => c.side);

      const payout = res.round.payout / API_MULTIPLIER;
      await coinScene.playRound(
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

  onMount(async () => {
    await document.fonts.ready;
    ready = true;

    if (isReplayMode()) {
      const params = getReplayUrlParams();
      // Get currency from URL params
      const extraParams = new URLSearchParams(window.location.search);
      const currencyFromParams = extraParams.get('currency') as Currency;
      $betAmount = Number(extraParams.get('amount')) / API_MULTIPLIER;
      currency.set(currencyFromParams ?? 'USD');
      const r = (await replay({ ...params })) as Replay;
      replayMode.set({ ...r, event: params.event });
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
  {#if ready}
    <div class="absolute inset-0">
      <CoinScene bind:this={coinScene} {handleSpin} {resetAfterBonus} />
    </div>
  {/if}

  <div class="absolute inset-0 z-10 pointer-events-none">
    <AutoplayModal {handleSpin} />
    <InfoModal />
  </div>
</div>
