import { getClient } from "./client";

export async function authenticate() {
    const client = getClient();
    return client.Authenticate();
}

export async function play(amount: number, mode = "base") {
    const client = getClient();
    return client.Play({ amount, mode });
}

export async function endRound() {
    const client = getClient();
    return client.EndRound();
}