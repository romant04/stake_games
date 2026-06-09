<script lang="ts">
  import {
    activeAutoplay,
    autoplayShouldStop,
    isBonusGameActive,
    turboMode,
  } from '$lib/stores/game';
  import type { AutoplayOptions } from '../types/autoplay';
  import { startAutoplay } from '../utils/startAutoplay';

  let {
    isAutoplayMenuOpen = $bindable(),
    handleSpin,
  }: {
    isAutoplayMenuOpen: boolean;
    handleSpin: () => Promise<void>;
  } = $props();

  let autoplayOptions = $state<AutoplayOptions>({
    spins: 50,
    turboSpins: false,
    autoplayBonus: false,
  });

  function handleAutoplay() {
    if (autoplayOptions.spins) {
      activeAutoplay.set(autoplayOptions);
      isAutoplayMenuOpen = false;
      if (autoplayOptions.turboSpins) {
        turboMode.set(true);
      }
      startAutoplay(handleSpin);
    }
  }
</script>

{#if isAutoplayMenuOpen}
  {@const autoplayValues = [10, 50, 100, 250, 500]}
  <div
    class="flex justify-center pointer-events-auto items-center fixed top-0 left-0 w-full z-50 h-full bg-[#002a67]/50"
  >
    <div
      class="p-8 min-w-1/2 bg-[#002a67] rounded-md flex flex-col justify-center items-center"
    >
      <p class="text-xl uppercase font-bold">Autoplay settings</p>
      <div class="flex justify-center items-center gap-10 mt-8">
        <div class="flex gap-3 items-center">
          <input
            bind:checked={autoplayOptions.turboSpins}
            type="checkbox"
            name="turbo"
            class="w-8 h-8 accent-[gold]"
          />
          <label for="turbo">Turbo spin</label>
        </div>
        <div class="flex gap-3 items-center">
          <input
            bind:checked={autoplayOptions.autoplayBonus}
            type="checkbox"
            name="stop"
            class="w-8 h-8 accent-[gold]"
          />
          <label for="stop">Autoplay bonus</label>
        </div>
      </div>

      <div class="flex flex-col items-center mt-6 xl:max-w-3/4 gap-3 m-auto">
        <label class="text-lg" for="count">Number of autospins</label>
        <div class="flex flex-wrap gap-5 items-center justify-center">
          {#each autoplayValues as option}
            <button
              onclick={() => (autoplayOptions.spins = option)}
              class="cursor-pointer {autoplayOptions.spins === option
                ? 'bg-[gold] text-black'
                : 'bg-transparent text-white'} text-lg px-5 py-3 rounded-md spin border-[gold] border-2"
              >{option}</button
            >
          {/each}
          <button
            onclick={() => (autoplayOptions.spins = -1)}
            class="cursor-pointer {autoplayOptions.spins === -1
              ? 'bg-[gold] text-black'
              : 'bg-transparent text-white'} text-xl px-5 py-3 rounded-md spin border-[gold] border-2"
            >&infin;</button
          >
        </div>
      </div>

      <div class="flex flex-col gap-2 mt-8 w-full">
        <button
          onclick={handleAutoplay}
          class="bg-[gold] transition-all duration-200 hover:bg-[#ffdf34] text-black font-bold cursor-pointer text-xl py-3 w-full rounded-md"
          >Start autoplay {autoplayOptions.spins
            ? `(${autoplayOptions.spins > 0 ? autoplayOptions.spins : '∞'})`
            : ''}</button
        >
        <button
          onclick={() => (isAutoplayMenuOpen = false)}
          class="bg-gray-600 transition-all duration-200 hover:bg-[#555b66] text-white font-bold cursor-pointer text-xl py-3 w-full rounded-md"
          >Cancel</button
        >
      </div>
    </div>
  </div>
{/if}
