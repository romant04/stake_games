import { balance, currency, roundActive } from '../stores/game';
import type { Currency } from 'stake-engine';

type Balance = {
  amount: number;
  currency: Currency;
};

type RoundState = {
  active: boolean;
};

export function setupEventListeners() {
  window.addEventListener('balanceUpdate', (event: Event) => {
    const e = event as CustomEvent<Balance>;

    balance.set(e.detail.amount);
    currency.set(e.detail.currency);
  });

  window.addEventListener('roundActive', (event: Event) => {
    const e = event as CustomEvent<RoundState>;

    console.log(e);
    roundActive.set(e.detail.active);
  });
}
