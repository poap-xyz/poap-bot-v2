export const BotConfig = {
    prefix: '!',
    channelPrefix: '#',

    defaultOptionMessage: '-',
    defaultResponseMessage: `Thanks for participating in the event. Here is a link where you can claim your POAP token: {code}`,
    responseMessageReplace: "{code}",

    powerEmoji: {
        5: "🆕",
        10: "🟢",
        20: "🟡",
        50: "🔴",
        100: "🔥"},

    poapCoreAPI: "https://api.poap.xyz",
    poapCoreTokenAPIURI: "/token/id/",
    poapCoreScanAPIURI: "/actions/scan/",
    poapCoreENSLookupAPIURI: "/actions/ens_lookup/",
    poapCoreEventAPIURI: "/events/id/",

    commandFilePrefix: 'command',
}

