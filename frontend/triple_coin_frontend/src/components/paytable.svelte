<script lang="ts">
  import front from '../assets/game/front.png';
  import back from '../assets/game/back.png';

  const PAYTABLE = [
    { combination: 'HHH', payout: 3.85 },
    { combination: 'HHT', payout: 1.15 },
    { combination: 'HTT', payout: 0.1 },
  ];
</script>

<div class="flex flex-col items-center gap-3">
  <h4 class="text-2xl font-bold">Pay Table</h4>
  <div class="flex flex-col w-max gap-2 bg-[#003075]/80 p-6 rounded-md">
    {#each PAYTABLE as row}
      <div class="flex items-center gap-4">
        <div class="flex gap-1">
          {#each row.combination.split('') as side}
            <img
              src={side === 'H' ? front : back}
              alt={side}
              class="w-12 h-12"
            />
          {/each}
        </div>
        <span class="text-xl font-medium">{row.payout}x</span>
      </div>
    {/each}
  </div>
</div>
