<script lang="ts">
  import front from '../assets/ui/info_front.png';
  import back from '../assets/ui/info_lose.png';
  import sideProfile from '../assets/ui/side.png';

  const PAYTABLE = [
    { combination: 'TTH', payout: '0.5x' },
    { combination: 'THH', payout: '2x' },
    { combination: 'HHH', payout: '4x' },
    { combination: 'SSS', payout: '10x-500x' },
  ];
</script>

<div class="flex flex-col items-center w-1/2">
  <div class="flex flex-col gap-2 gap-4 w-full">
    {#each PAYTABLE as row}
      <div class="flex items-center justify-between gap-3 w-full">
        <div class={`flex ${row.combination === 'SSS' && 'translate-x-1'}`}>
          {#each row.combination.split('') as side}
            <img
              src={side === 'H' ? front : side === 'T' ? back : sideProfile}
              alt={side}
              class={`${side !== 'S' ? 'relative -ml-5 translate-x-10' : 'ml-8'} h-[64px] w-auto`}
            />
          {/each}
        </div>
        <span
          class="text-3xl font-[900] font-merriweather text-[#EEC53A] text-stroke"
          >{row.payout}</span
        >
      </div>
    {/each}
  </div>
</div>
