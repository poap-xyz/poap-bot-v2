export const BotConfig = {
    prefix: '!',
    channelPrefix: '#',

    defaultOptionMessage: '-',
    defaultResponseMessage: `Thanks for participating in the event. Here is a link where you can claim your POAP token: {code}`,
    responseMessageReplace: "{code}",

    poapCoreAPI: "https://api.poap.xyz",
    poapCoreTokenAPIURI: "/token/id/",
    poapCoreScanAPIURI: "/actions/scan/",
    poapCoreENSLookupAPIURI: "/actions/ens_lookup/",
    poapCoreEventAPIURI: "/events/id/",
    
    poapSubgraphMainnet: "https://api.thegraph.com/subgraphs/name/poap-xyz/poap",
    poapSubgraphxDai: "https://api.thegraph.com/subgraphs/name/poap-xyz/poap-xdai",
    poapContract: "0x22C1f6050E56d2876009903609a2cC3fEf83B415",
    zeroAddress: "0x0000000000000000000000000000000000000000",
}

