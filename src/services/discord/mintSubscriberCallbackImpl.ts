import {MessageEmbed, TextChannel} from "discord.js";
import {MintSubscriberCallback} from "../../interfaces/callback/mintSubscriberCallback";
import {inject, injectable} from "inversify";
import {logger} from "../../logger";
import {Token} from "../../models/poap/token";
import {TokenCacheService} from "../../interfaces/services/cache/tokenCacheService";
import {AccountCacheService} from "../../interfaces/services/cache/accountCacheService";
import {Account} from "../../models/poap/account";
import {BotConfig} from "../../config/bot.config";
import {SubscribedChannelService} from "../../interfaces/services/core/subscribedChannelService";

export class MintSubscriberCallbackImpl implements MintSubscriberCallback{
    private readonly tokenCacheService: TokenCacheService;
    private readonly accountCacheService: AccountCacheService;
    private readonly subscribedChannelService: SubscribedChannelService;

    constructor(tokenCacheService: TokenCacheService,
                accountCacheService: AccountCacheService,
                subscribedChannelService: SubscribedChannelService) {
        this.tokenCacheService = tokenCacheService;
        this.accountCacheService = accountCacheService;
        this.subscribedChannelService = subscribedChannelService;
    }

    async callback(tokenId: string) {
        try {
            await this.sendMintInfoToChannels(tokenId);
        }catch (e){
            logger.error(`[MintChannelService] Executing callback, error: ${e}`)
        }
    }

    private async sendMintInfoToChannels(tokenId: string){
        const channels = this.subscribedChannelService.getAllTextChannels();
        for(let i = 0; i < channels.length;i++){
            await this.sendMintInfoToChannel(channels[i], tokenId);
        }
    }

    private async sendMintInfoToChannel(channel: TextChannel, tokenId: string | number){
        try {
            const token = await this.tokenCacheService.getTokenFromCache(tokenId);
            const account = await this.accountCacheService.getAccountFromCache(token.owner);
            const embedToSend = MintSubscriberCallbackImpl.getTokenEmbed(token, account);
            await channel.send(embedToSend)
        }catch (e){
            logger.error(`[MintChannelService] Executing sendMintInfoToChannel, error: ${e}`);
        }
    }

    private static getTokenEmbed(token: Token, account: Account){
        const poapPower = account.tokens.length;
        return new MessageEmbed()
            .setTitle(`${token.action}: ${token.event.name} `)
            .setColor(token.chain == "Mainnet" ? "#5762cf" : "#48A9A9")
            .addFields(
                {
                    name: "POAP Power",
                    value: `${MintSubscriberCallbackImpl.getEmojiByPoapPower(poapPower)}  ${poapPower}`,
                    inline: true,
                },
                { name: "Token ID", value: `#${token.tokenId}`, inline: true },
                { name: "Event ID", value: `#${token.event.id}`, inline: true }
            )
            .setURL(`https://poap.gallery/event/${token.event.id}/?utm_share=discordfeed`)
            .setTimestamp()
            .setAuthor(
                account.ens ? account.ens : account.address.toLowerCase(),
                ``,
                `https://app.poap.xyz/scan/${account.address}/?utm_share=discordfeed`
            )
            .setThumbnail(token.event.image_url)
            .setFooter('POAP Bot', BotConfig.poapLogoURL);
    }

    private static getEmojiByPoapPower(poapPower: number): string{
        const powerEmoji = BotConfig.powerEmoji;
        let lastKey;

        for (let key in powerEmoji) {
            if (powerEmoji.hasOwnProperty(key)) {
                if(poapPower < parseInt(key)){
                    return powerEmoji[key];
                }
                lastKey = key;
            }
        }

        return powerEmoji[lastKey];
    }

}