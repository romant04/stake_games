<script lang="ts">
  import front from '../assets/game/front.png';
  import back from '../assets/game/back.png';
  import sideProfile from '../assets/game/side.png';

  const PAYTABLE = [
    { combination: 'SSS', payout: '10x-500x' },
    { combination: 'HHH', payout: '4x' },
    { combination: 'HH', payout: '1.5x' },
    { combination: 'H', payout: '0.5x' },
  ];
</script>

<div class="flex flex-col items-center">
  <div class="flex flex-col w-max gap-2 bg-[#003075]/80 p-4 rounded-md gap-4">
    {#each PAYTABLE as row}
      <div class="flex items-center justify-between gap-3">
        <div class="flex gap-1">
          {#each row.combination.split('') as side}
            <img
              src={side === 'H' ? front : side === 'T' ? back : sideProfile}
              alt={side}
              class="w-10 h-10"
            />
          {/each}
        </div>
        <span class="text-lg font-medium">{row.payout}</span>
      </div>
    {/each}
  </div>
</div>
