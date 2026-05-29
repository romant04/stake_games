export interface Replay {
  payoutMultiplier?: number;
  costMultiplier?: number;
  state?: [
    {
      coins: { index: number; side: 'T' | 'H' | 'S' }[];
      index: number;
      multiplier: number;
      numberRolled: number;
      totalWin: number;
      type: string;
    },
    {
      amount: number;
      index: number;
      type: string;
    },
  ];
  error?: any;
  event: string;
}
