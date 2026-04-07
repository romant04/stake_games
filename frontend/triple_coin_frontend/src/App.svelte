<script lang="ts">
    import { onMount } from "svelte";
    import { initClient } from "$lib/engine/client";
    import { setupEventListeners } from "$lib/engine/events";
    import { authenticate, play, endRound } from "$lib/engine/actions";
    import { balance, currency, isPlaying, roundActive } from "$lib/stores/game";
    import {DisplayAmount} from "stake-engine";
    import front from "./assets/game/front.png"
    import back from "./assets/game/back.png"

    let coinResults = ["?", "?", "?"];
    const API_MULTIPLIER = 1000000

    interface PlayResponseState0 {
        coins: string[];
        index: number;
        multiplier: number;
        numberRolled: number;
        totalWin: number;
        type: string;
    }
    interface PlayResponseState1 {
        amount: number;
        index: number;
        type: string;
    }

    type PlayResponseState = [PlayResponseState0, PlayResponseState1]

    async function handleSpin() {
        isPlaying.set(true);

        try {
            let userBetAmount = 1.00; // Example: let's say the user wants to bet $1.00
            const betAmount = userBetAmount * API_MULTIPLIER; // Calculate the required bet amount

            const res = await play(betAmount, "base");

            console.log("Play Response:", res);

            // 2. Update UI with coin results from math
            if (res.round.state) {
                const state = res.round.state as PlayResponseState;
                coinResults = state[0].coins
            }

            // 3. Finalize the round in Stake Engine
            await endRound();

        } catch (err) {
            console.error("Game Error:", err);
        } finally {
            isPlaying.set(false);
        }
    }

    onMount(async () => {
        // Initialize SDK and Listeners
        initClient();
        setupEventListeners();

        // Initial Auth to get player data/balance
        try {
            await authenticate();
        } catch (err) {
            alert("Auth failed: " + err);
        }
    });
</script>

<div class="game-container">
    <div class="head">
        <h1>Triple coin</h1>

        <div class="balance-display">
            {#if $balance !== null}
                Balance: {DisplayAmount({amount: $balance, currency: $currency}, {
                removeSymbol: true,
                decimals: 2,
            })} {$currency}
            {:else}
                Loading Balance...
            {/if}
        </div>
    </div>


    <div class="coin-row">
        {#each coinResults as coin}
            <div class="coin" class:flipping={$isPlaying}>
                {#if coin === "H"}
                    <img src={front} alt="seven"/>
                {:else if coin === "T"}
                    <img src={back} alt="seven"/>
                {:else}
                    <img src={front} alt="">
                {/if}
            </div>
        {/each}
    </div>

    <button
            class="spin-button"
            on:click={handleSpin}
            disabled={$roundActive || $isPlaying}
    >
        {#if $isPlaying} Flipping... {:else} SPIN {/if}
    </button>
</div>

<style>
    .coin-row { display: flex; gap: 40px; justify-content: center; margin: 20px; }
    .coin { width: 120px; height: 120px; }
    .coin > img {width: 100%; height: 100%;}
    .flipping { animation: spin 0.5s infinite; }
    @keyframes spin { from { transform: rotateY(0); } to { transform: rotateY(360deg); } }
</style>