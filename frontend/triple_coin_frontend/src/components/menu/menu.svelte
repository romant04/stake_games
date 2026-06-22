<script lang="ts">
  import {
    activeAutoplay,
    autoplayShouldStop,
    balance,
    currency,
    isPlaying,
    replayMode,
    roundActive,
    turboMode,
  } from '$lib/stores/game';
  import { DisplayAmount } from 'stake-engine';
  import { slide } from 'svelte/transition';
  import { allowedBets } from '$lib/stores/game';
  import { API_MULTIPLIER } from '../../constants/api';
  import Lightning from '../icons/lightning.svelte';
  import Spin from '../icons/spin.svelte';
  import { isReplayMode } from 'stake-engine-client';
  import TextBlock from './text-block.svelte';
  import BetControl from './bet-control.svelte';
  import { getCurrencySymbol } from '$lib/game/utils/currencySymbols';

  let {
    handleSpin,
    handleReplay,
    lastWin = $bindable(),
    betAmount = $bindable(),
    isInfoOpen = $bindable(),
    isAutoplayMenuOpen = $bindable(),
  }: {
    handleSpin: () => void;
    handleReplay: () => void;
    lastWin: number;
    betAmount: number;
    isInfoOpen: boolean;
    isAutoplayMenuOpen: boolean;
  } = $props();

  let isMenuOpen = $state(false);

  function handleInfoOpen() {
    isMenuOpen = false;
    isInfoOpen = true;
  }

  function handleBetAmountChange(increment: boolean) {
    const maxBet = $balance / API_MULTIPLIER;
    if (increment) {
      const nextBet = $allowedBets.find((b) => b > betAmount);
      if (nextBet && nextBet <= maxBet) {
        betAmount = nextBet;
        return;
      }

      const biggestBet = [...$allowedBets].reverse().find((b) => b <= maxBet);
      if (biggestBet) {
        betAmount = biggestBet;
      }
    } else {
      const prevBet = [...$allowedBets]
        .reverse()
        .find((b) => b < betAmount && b <= maxBet);
      if (prevBet) {
        betAmount = prevBet;
      }
    }
  }

  function handleTurboModeChange() {
    turboMode.set(!$turboMode);
  }

  function handleSpinOrReplay() {
    if ($replayMode) {
      handleReplay();
    } else {
      handleSpin();
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.code === 'Space') {
      if (!$isPlaying) {
        handleSpinOrReplay();
      }
    }
  }
</script>

<svelte:window on:keydown|preventDefault={onKeyDown} />

<div
  class="bg-[#003075]/80 w-full h-22 lg:h-24 rounded-md flex justify-between lg:grid lg:grid-cols-3 px-2 md:px-4 xl:px-8 2xl:px-10 items-center"
>
  {#if isMenuOpen}
    <div
      in:slide
      out:slide
      class="flex flex-col gap-5 rounded-md absolute px-3 py-4 z-50 bg-[#002a67]/90 bottom-full left-0 h-36 w-48"
    >
      <button
        onclick={handleInfoOpen}
        class="rounded-md bg-[#0049b3] hover:bg-[#0043a4] py-1 transition-all duration-300 ease cursor-pointer"
        >Info tab</button
      >
    </div>
  {/if}

  <div class="flex gap-3 md:gap-5 items-center">
    <button
      class="cursor-pointer bg-gray-800 w-8 h-8 md:w-11 md:h-11 rounded-md flex flex-col gap-[6px] md:gap-2 items-center justify-center"
      onclick={() => (isMenuOpen = !isMenuOpen)}
    >
      {#each [1, 2, 3] as _}
        <div class="w-3/4 h-[2px] md:h-[3px] bg-gray-100 rounded-full"></div>
      {/each}
    </button>
    <TextBlock
      content={`
        ${DisplayAmount(
          { amount: $balance, currency: $currency },
          {
            removeSymbol: true,
            decimals: 2,
          },
        )}${getCurrencySymbol($currency)}`}
    />
    <TextBlock
      content={`
        ${DisplayAmount(
          { amount: lastWin, currency: $currency },
          {
            removeSymbol: true,
            decimals: 2,
          },
        )}${getCurrencySymbol($currency)}`}
      {lastWin}
    />
  </div>

  <div
    class="absolute -top-14 left-1/2 -translate-x-1/2 lg:static lg:left-0 lg:translate-0 lg:top-0"
  >
    <BetControl {betAmount} {handleBetAmountChange} />
  </div>

  <div class="flex gap-2 md:gap-4 justify-self-end">
    <div class="relative">
      <button
        class="rounded-full text-3xl md:text-4xl flex justify-center items-center border-2 border-[gold] spin w-15 h-15 md:h-18 md:w-18 bg-transparent disabled:bg-[#0042a2]/30 disabled:cursor-default cursor-pointer"
        disabled={$isPlaying}
        onclick={handleSpinOrReplay}
      >
        {#if $isPlaying}
          <div class="spinning">
            <Spin />
          </div>
        {:else}
          <Spin />
        {/if}
      </button>
      {#if !isReplayMode()}
        <button
          class="absolute w-max cursor-pointer spin text-[12px] md:text-xs -bottom-2 left-1/2 -translate-x-1/2 uppercase bg-[#003075] px-2 md:py-1 md:px-3 border-[1px] border-[gold] rounded-md"
          class:stopping={$autoplayShouldStop}
          onclick={() => {
            if ($activeAutoplay && !$autoplayShouldStop) {
              autoplayShouldStop.set(true);
            } else if (!$activeAutoplay) {
              isAutoplayMenuOpen = true;
            }
          }}
        >
          {#if $activeAutoplay}
            {$autoplayShouldStop
              ? 'Stopping...'
              : `Stop (${$activeAutoplay.spins >= 0 ? $activeAutoplay.spins : '∞'})`}
          {:else}
            Autoplay
          {/if}
        </button>
      {/if}
    </div>

    <button
      class={`rounded-full text-xl md:text-2xl flex justify-center items-center border-2 ${$turboMode ? 'bg-[gold] text-black disabled:bg-[gold]' : 'bg-transparent text-white disabled:bg-[#0042a2]/30'} border-[gold] spin h-11 w-11 md:h-15 md:w-15 disabled:cursor-default cursor-pointer`}
      disabled={$isPlaying}
      onclick={handleTurboModeChange}
    >
      <Lightning />
    </button>
  </div>
</div>
