<script lang="ts">
  import { balance, currency, isPlaying, roundActive } from '$lib/stores/game';
  import { DisplayAmount } from 'stake-engine';
  import { slide } from 'svelte/transition';
  import Paytable from './paytable.svelte';
  import { allowedBets } from '$lib/stores/game';
  import { API_MULTIPLIER } from '../constants/api';

  let {
    handleSpin,
    lastWin = $bindable(),
    betAmount = $bindable(),
    isInfoOpen = $bindable(),
  }: {
    handleSpin: () => void;
    lastWin: number;
    betAmount: number;
    isInfoOpen: boolean;
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

  $effect(() => {
    console.log($roundActive, $isPlaying);
  });
</script>

<div
  class="bg-[#003075]/80 w-full h-24 rounded-md grid grid-cols-3 px-6 xl:px-8 2xl:px-10 items-center"
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

  <div class="flex gap-5 items-center">
    <button
      class="cursor-pointer bg-gray-800 w-11 h-11 rounded-md flex flex-col gap-2 items-center justify-center"
      onclick={() => (isMenuOpen = !isMenuOpen)}
    >
      {#each [1, 2, 3] as _}
        <div class="w-3/4 h-[3px] bg-gray-100 rounded-full"></div>
      {/each}
    </button>
    <div class="flex flex-col gap-1">
      <span class="text-xs text-gray-400 uppercase">Balance</span>
      <span class="text-sm font-medium"
        >{$currency}
        {DisplayAmount(
          { amount: $balance, currency: $currency },
          {
            removeSymbol: true,
            decimals: 2,
          },
        )}</span
      >
    </div>
    <div class="flex flex-col gap-1">
      <span class="text-xs text-gray-400 uppercase">Last Win</span>
      <span class="text-sm font-medium {lastWin > 0 && 'text-green-500'}"
        >{$currency}
        {DisplayAmount(
          { amount: lastWin, currency: $currency },
          {
            removeSymbol: true,
            decimals: 2,
          },
        )}</span
      >
    </div>
  </div>

  <div
    class="bg-gray-900/60 flex flex-col w-48 px-4 py-2 rounded-md items-center justify-self-center"
  >
    <span class="uppercase text-xd text-gray-400">Bet</span>
    <div class="flex justify-between items-center w-full">
      <button
        class="bg-gray-600/40 px-4 h-8 rounded-md cursor-pointer"
        onclick={() => handleBetAmountChange(false)}>-</button
      >
      <div>{$currency} {betAmount}</div>
      <button
        class="bg-gray-600/40 px-4 h-8 rounded-md cursor-pointer"
        onclick={() => handleBetAmountChange(true)}>+</button
      >
    </div>
  </div>

  <button
    class="rounded-full border-2 border-[gold] spin h-20 w-20 bg-[#0042a2]/70 disabled:bg-[#0042a2]/30 disabled:cursor-default cursor-pointer justify-self-end"
    disabled={$isPlaying}
    onclick={handleSpin}
  >
    {#if $isPlaying}
      Spinning..
    {:else}
      SPIN
    {/if}
  </button>
</div>
