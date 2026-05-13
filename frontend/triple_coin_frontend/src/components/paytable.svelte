<script lang="ts">
  import front from '../assets/game/front.png';
  import back from '../assets/game/back.png';
  import sideProfile from '../assets/game/side.png';

  const PAYTABLE = [
    { combination: 'SSS', payout: 50 },
    { combination: 'HHH', payout: 4 },
    { combination: 'HH', payout: 1.5 },
    { combination: 'H', payout: 0.5 },
  ];
</script>

<div class="flex flex-col items-center gap-3">
  <div class="flex flex-col w-max gap-2 bg-[#003075]/80 p-6 rounded-md">
    {#each PAYTABLE as row}
      <div class="flex items-center justify-between gap-4">
        <div class="flex gap-1">
          {#each row.combination.split('') as side}
            <img
              src={side === 'H' ? front : 'T' ? back : sideProfile}
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
