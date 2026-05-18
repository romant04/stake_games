<script lang="ts">
  import { gameHistory } from '$lib/stores/game.js';
  import front from '../assets/game/front.png';
  import back from '../assets/game/back.png';
  import sideProfile from '../assets/game/side.png';

  const MAX_HISTORY = 5;
  $effect(() => {
    console.log('Game history updated:', $gameHistory);
  });

  function getOpacityFromIndex(index: number, length: number) {
    const realIndex = index + (MAX_HISTORY - length);
    const opacityValues = [
      'opacity-50',
      'opacity-60',
      'opacity-70',
      'opacity-80',
      'opacity-100',
    ];
    return opacityValues[realIndex] || 'opacity-50';
  }
</script>

<div class="flex flex-col items-center gap-3 bg-[#003075]/80 p-3 rounded-md">
  <p class="text-2xl">Last games</p>
  {#if $gameHistory.length > 0}
    {#each $gameHistory.slice(-MAX_HISTORY) as game, index}
      {@const opacityValue = getOpacityFromIndex(
        index,
        Math.min($gameHistory.length, MAX_HISTORY),
      )}
      <div class="flex gap-2">
        {#each game.split('') as side}
          <img
            src={side === 'H' ? front : side === 'T' ? back : sideProfile}
            alt={side}
            class="w-12 h-12 {opacityValue}"
          />
        {/each}
      </div>
    {/each}
  {:else}
    <div class="flex flex-col w-max gap-2 bg-[#003075]/80 p-6 rounded-md">
      <p class="text-gray-300">No games yet...</p>
    </div>
  {/if}
</div>
