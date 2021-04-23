import {MintChannelService} from "../../interfaces/services/discord/mintChannelService";
import {MessageEmbed, TextChannel} from "discord.js";
import {SubscriberService} from "../../interfaces/services/pubsub/subscriberService";
import {SubscriberCallback} from "../../interfaces/callback/subscriberCallback";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {logger} from "../../logger";
import {ContractService} from "../../interfaces/services/core/contract/contractService";
import {Token} from "../../models/poap/token";
import {ChannelService} from "../../interfaces/services/discord/channelService";
import {PublisherService} from "../../interfaces/services/pubsub/publisherService";
import {TokenCacheService} from "../../interfaces/services/cache/tokenCacheService";
import {AccountCacheService} from "../../interfaces/services/cache/accountCacheService";
import {Redis} from "ioredis";
import {Worker} from "bullmq";
import {Account} from "../../models/poap/account";
import {BotConfig} from "../../config/bot.config";

@injectable()
export class MintChannelServiceImpl implements MintChannelService{
    private readonly channels: TextChannel[];
    private readonly subscriberService: SubscriberService;
    private readonly channelService: ChannelService;
    private subscriberCallback: SubscriberCallback;
    private readonly tokenCacheService: TokenCacheService;
    private readonly accountCacheService: AccountCacheService;

    constructor(@inject(TYPES.SubscriberService) subscriberService: SubscriberService,
                @inject(TYPES.ChannelService) channelService: ChannelService,
                @inject(TYPES.TokenCacheService) tokenCacheService: TokenCacheService,
                @inject(TYPES.AccountCacheService) accountCacheService: AccountCacheService) {
        this.channels = [];
        this.subscriberService = subscriberService;
        this.channelService = channelService;
        this.tokenCacheService = tokenCacheService;
        this.accountCacheService = accountCacheService;
    }

    async initSubscribers(){
        try {
            this.subscriberCallback = this.createSubscriberCallback();
            await this.loadChannels();
            await this.subscriberService.subscribeToTokenChannel(this.getSubscriberCallback());
        }catch (e){
            logger.error(`[MintChannelService] Init failed, error: ${e}`);
        }
    }

    async loadChannels(){
        const channel = await this.channelService.getTextChannel("752004977676910594", "752318357587624038");
        this.addChannelToMint(channel);
    }

    private createSubscriberCallback(): SubscriberCallback{
        const _this = this;
        return new class implements SubscriberCallback {
            async callback(message: string) {
                try {
                    await _this.sendMintInfoToChannels(message);
                }catch (e){
                    logger.error(`[MintChannelService] Executing callback, error: ${e}`)
                }
            }
        };
    }

    private async sendMintInfoToChannel(channel: TextChannel, tokenId: string | number){
        try {
            const token = await this.tokenCacheService.getTokenFromCache(tokenId);
            const account = await this.accountCacheService.getAccountFromCache(token.owner);
            const embedToSend = MintChannelServiceImpl.getTokenEmbed(token, account);
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
                    value: `${MintChannelServiceImpl.getEmojiByPoapPower(poapPower)}  ${poapPower}`,
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
            .setFooter('POAP Bot', 'https://media-exp1.licdn.com/dms/image/C4E0BAQH41LILaTN3cw/company-logo_200_200/0/1561273941114?e=2159024400&v=beta&t=ty-jdXGeZd1OE4V-WQP4owQ1_qvdEzgDJq5jOUw2S-s');
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

    private async sendMintInfoToChannels(tokenId: string){
        for(let i = 0; i < this.channels.length;i++){
            await this.sendMintInfoToChannel(this.channels[i], tokenId);
        }
    }

    getSubscribedChannels(): TextChannel[]{
        return [...this.channels];
    }

    getSubscriberCallback(): SubscriberCallback {
        return this.subscriberCallback;
    }

    addChannelToMint(channel: TextChannel) {
        this.channels.push(channel);
    }


}