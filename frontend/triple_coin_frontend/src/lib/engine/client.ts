import { RGSClient } from "stake-engine";

let client: ReturnType<typeof RGSClient>;

export function initClient() {
    if (typeof window === "undefined") return;

    client = RGSClient({
        url: window.location.href,
    });

    return client;
}

export function getClient() {
    return client;
}
