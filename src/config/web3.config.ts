export const Web3Config = {
    poapContract: "0x22C1f6050E56d2876009903609a2cC3fEf83B415",
    zeroAddress: "0x0000000000000000000000000000000000000000",
    WSOptions: {
        // Enable auto reconnection
        reconnect: {
            auto: true,
            delay: 5000, // ms
            maxAttempts: 20,
            onTimeout: false,
        },
    },

    poapSubgraphMainnet: "https://api.thegraph.com/subgraphs/name/poap-xyz/poap",
    poapSubgraphxDai: "https://api.thegraph.com/subgraphs/name/poap-xyz/poap-xdai",
}