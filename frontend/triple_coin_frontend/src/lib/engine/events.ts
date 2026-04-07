import { balance, currency, roundActive } from "../stores/game";

type Balance = {
    amount: number;
    currency: string;
};

type RoundState = {
    active: boolean;
};

export function setupEventListeners() {
    window.addEventListener("balanceUpdate", (event: Event) => {
        const e = event as CustomEvent<Balance>;

        balance.set(e.detail.amount);
        currency.set(e.detail.currency);
    });

    window.addEventListener("roundActive", (event: Event) => {
        const e = event as CustomEvent<RoundState>;

        roundActive.set(e.detail.active);
    });
}