export const BotConfig = {
    prefix: '!',
    channelPrefix: '#',
    commandPrefix: 'command',
    defaultOptionMessage: '-',
    defaultResponseMessage: `Thanks for participating in the event. Here is a link where you can claim your POAP token: {code}`,
    responseMessageReplace: "{code}",
    poapSubgraphMainnet: "https://api.thegraph.com/subgraphs/name/poap-xyz/poap",
    poapSubgraphxDai: "https://api.thegraph.com/subgraphs/name/poap-xyz/poap-xdai",
    poapCoreAPI: "https://poap.xyz/",
    poapCoreTokenAPIURI: "/token/id/",
    poapCoreScanAPIURI: "/actions/scan/",
    poapCoreENSLookupAPIURI: "/actions/ens_lookup/",
    poapCoreEventAPIURI: "/events/id/"
}

