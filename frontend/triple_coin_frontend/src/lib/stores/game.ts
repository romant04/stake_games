import { writable } from 'svelte/store';
import type { Currency } from 'stake-engine';

export const balance = writable<number | null>(null);
export const currency = writable<Currency | null>(null);
export const roundActive = writable(false);
export const isPlaying = writable(false);
export const allowedBets = writable([0]);

export const gameHistory = writable<string[]>([]);
