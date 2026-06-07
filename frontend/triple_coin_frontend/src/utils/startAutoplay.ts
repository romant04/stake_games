import {
  activeAutoplay,
  autoplayShouldStop,
  isBonusGameActive,
} from '../lib/stores/game';
import { get } from 'svelte/store';

export async function startAutoplay(handleSpin: () => Promise<void>) {
  if (get(activeAutoplay)?.spins === 0 || get(autoplayShouldStop)) {
    autoplayShouldStop.set(false);
    activeAutoplay.set(null);
    return;
  }

  await handleSpin();
  activeAutoplay.set({
    ...get(activeAutoplay)!,
    spins: get(activeAutoplay)!.spins ? get(activeAutoplay)!.spins - 1 : 0,
  });

  if (get(isBonusGameActive) && !get(activeAutoplay)?.autoplayBonus) {
    return;
  }

  if (get(isBonusGameActive) && get(activeAutoplay)?.autoplayBonus) {
    await handleSpin();
    return;
  }

  await startAutoplay(handleSpin);
}
