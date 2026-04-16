<script lang="ts">
    import { onMount } from "svelte";
    import { initClient } from "$lib/engine/client";
    import { setupEventListeners } from "$lib/engine/events";
    import { authenticate, play, endRound } from "$lib/engine/actions";
    import { balance, currency, isPlaying, roundActive } from "$lib/stores/game";
    import {DisplayAmount} from "stake-engine";
    import { fly, fade } from "svelte/transition";
    import front from "./assets/game/front.png"
    import back from "./assets/game/back.png"

    let coinResults = $state(["?", "?", "?"]);
    const API_MULTIPLIER = 1000000
    let betAmount = $state(10);
    let payout = $state(null);

    $effect(() => {
        if (payout === null) return;

        const timeout = setTimeout(() => {
            payout = null;
        }, 500);

        return () => {
            clearTimeout(timeout);
        };
    });

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

        const start = Date.now();

        try {
            const apiBetAmount = betAmount * API_MULTIPLIER;
            const res = await play(apiBetAmount, "base");

            console.log("Play response:", res);

            if (res.round.state) {
                const state = res.round.state as PlayResponseState;
                coinResults = state[0].coins;
                payout = res.round.payout / API_MULTIPLIER;

                if (state[0].totalWin > 0) {
                    await endRound();
                }
            }

        } catch (err) {
            console.error(err);
        } finally {
            const elapsed = Date.now() - start;
            const minDuration = 500;

            if (elapsed < minDuration) {
                await new Promise(r => setTimeout(r, minDuration - elapsed));
            }

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
    {#if payout !== null}
        <span
            class="info"
            style="{payout > 0 ? 'color: gold;' : 'color: crimson;'}"
            in:fly={{ y: 40, duration: 400 }}
            out:fade={{ duration: 200 }}
        >
            +{payout} {$currency}
        </span>
    {/if}

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
            {console.log("Rendering coin with value:", coin)}
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

    <div class="bet-section">
        <div class="bet-input">
            <label for="betAmount">Bet Amount:</label>
            <input name="betAmount" type="number" bind:value={betAmount}>
            <span>{$currency}</span>
        </div>

        <button
                class="spin-button"
                on:click={handleSpin}
                disabled={$roundActive || $isPlaying}
        >
            {#if $isPlaying} Flipping... {:else} SPIN {/if}
        </button>
    </div>

</div>

<style>
    .coin-row { display: flex; gap: 40px; justify-content: center; margin: 20px; }
    .coin { width: 120px; height: 120px; }
    .coin > img {width: 100%; height: 100%;}
    .flipping { animation: spin 0.5s infinite; }
    @keyframes spin { from { transform: rotateY(0); } to { transform: rotateY(360deg); } }
</style>