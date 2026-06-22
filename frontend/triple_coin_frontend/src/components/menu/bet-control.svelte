<script lang="ts">
  import { currency, replayMode } from '$lib/stores/game.js';
  import { getCurrencySymbol } from '$lib/game/utils/currencySymbols';

  let {
    betAmount,
    handleBetAmountChange,
  }: {
    betAmount: number;
    handleBetAmountChange: (increment: boolean) => void;
  } = $props();
</script>

<div
  class="bg-gray-900/60 flex flex-col w-42 lg:w-48 px-4 py-2 rounded-md items-center justify-self-center"
>
  <span class="uppercase text-sm text-gray-400">Amount</span>
  <div class="flex justify-between items-center w-full">
    <button
      class="bg-gray-600/40 px-4 h-8 rounded-md cursor-pointer"
      disabled={$replayMode !== null}
      onclick={() => handleBetAmountChange(false)}>-</button
    >
    <div>{betAmount}{getCurrencySymbol($currency)}</div>
    <button
      class="bg-gray-600/40 px-4 h-8 rounded-md cursor-pointer"
      disabled={$replayMode !== null}
      onclick={() => handleBetAmountChange(true)}>+</button
    >
  </div>
</div>
