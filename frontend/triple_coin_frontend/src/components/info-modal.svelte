<script lang="ts">
  import Paytable from './paytable.svelte';
  let { isInfoOpen = $bindable() }: { isInfoOpen: boolean } = $props();
</script>

{#if isInfoOpen}
  <button
    class="flex justify-center pointer-events-auto items-center fixed top-0 left-0 w-full z-50 h-full bg-[#002a67]/50"
    onclick={() => {
      isInfoOpen = false;
    }}
  >
    <div
      class="flex flex-col items-center p-10 min-w-1/2 bg-[#002a67] rounded-md"
    >
      <p class="text-3xl">
        Triple Coin Flip | <span class="text-gray-200">INFO</span>
      </p>
      <div class="py-6">
        <Paytable />
      </div>
      <p class="text-sm text-gray-300 mt-5">
        <span class="text-white">Details</span>
        <br />
        RTP: 96.06%
      </p>
      <p class="max-w-[500px] text-xs mt-3">
        Malfunction voids all wins and plays. A consistent internet connection
        is required. In the event of a disconnection, reload the game to finish
        any uncompleted rounds. The expected return is calculated over many
        plays. The game display is not representative of any physical device and
        is for illustrative purposes only. Winnings are settled according to the
        amount received from the Remote Game Server and not from events within
        the web browser. TM and © 2026 Stake Engine.
      </p>
    </div>
  </button>
{/if}
