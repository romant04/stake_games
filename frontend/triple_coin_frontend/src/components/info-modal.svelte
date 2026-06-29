<script lang="ts">
  import logo from '../assets/info_logo.png';
  import infoHeadline from '../assets/info_headline.png';
  import button from '../assets/ui/button.png';
  import buttonHover from '../assets/ui/button_hover.png';

  import { isGameInfoOpen } from '$lib/stores/game';
  import Paytable from './paytable.svelte';
  import { fade } from 'svelte/transition';

  /*
  *  Malfunction voids all wins and plays. A consistent internet connection
        is required. In the event of a disconnection, reload the game to finish
        any uncompleted rounds. The expected return is calculated over many
        plays. The game display is not representative of any physical device and
        is for illustrative purposes only. Winnings are settled according to the
        amount received from the Remote Game Server and not from events within
        the web browser. TM and © 2026 Stake Engine.*/
</script>

{#if $isGameInfoOpen}
  <div
    in:fade={{ duration: 200 }}
    out:fade={{ duration: 200 }}
    class="flex flex-col gap-12 overflow-auto pointer-events-auto py-5 items-center fixed top-0 left-0 w-full z-50 h-full bg-[#26140D]/65 backdrop-blur-sm"
  >
    <div class="relative">
      <img src={logo} alt="logo" class="max-h-[500px] md:h-[400px] w-auto" />
      <img
        class="absolute -bottom-8 w-1/2 left-1/2 -translate-x-1/2"
        src={infoHeadline}
        alt="info headline"
      />
    </div>

    <div class="flex w-full items-start gap-8 px-8">
      <Paytable />

      <div class="flex flex-col mt-2 gap-2 max-w-1/2">
        <h4
          class="text-3xl font-[900] font-merriweather text-[#EEC53A] text-stroke"
        >
          RTP: 96.46%
        </h4>
        <p class="text-md font-merriweather text-justify text-[#ECE7C4]">
          Malfunction voids all wins and plays. A consistent internet connection
          is required. In the event of a disconnection, reload the game to
          finish any uncompleted rounds. The expected return is calculated over
          many plays. The game display is not representative of any physical
          device and is for illustrative purposes only. Winnings are settled
          according to the amount received from the Remote Game Server and not
          from events within the web browser. TM and © 2026 Stake Engine.
        </p>
      </div>
    </div>

    <button
      onclick={() => ($isGameInfoOpen = false)}
      class="relative w-[300px] min-h-[80px] group overflow-hidden cursor-pointer"
    >
      <!-- base texture -->
      <img
        src={button}
        alt=""
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-100 group-hover:opacity-0"
      />

      <!-- hover texture -->
      <img
        src={buttonHover}
        alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-100 group-hover:opacity-100"
      />

      <!-- text layer -->
      <span
        class="relative z-10 flex items-center justify-center w-full h-full text-[24px] text-[#ECE7C4] font-[900] font-merriweather"
      >
        CLOSE
      </span>
    </button>
  </div>
{/if}
