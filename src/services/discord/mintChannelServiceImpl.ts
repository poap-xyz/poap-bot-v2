import {MintChannelService} from "../../interfaces/services/discord/mintChannelService";
import {MessageEmbed, TextChannel} from "discord.js";
import {SubscriberService} from "../../interfaces/services/pubsub/subscriberService";
import {SubscriberCallback} from "../../interfaces/callback/subscriberCallback";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {logger} from "../../logger";
import {MintService} from "../../interfaces/services/core/mintService";
import {Token} from "../../models/poap/token";
import {ChannelService} from "../../interfaces/services/discord/channelService";

@injectable()
export class MintChannelServiceImpl implements MintChannelService{
    private readonly channels: TextChannel[];
    private readonly subscriberService: SubscriberService;
    private readonly mintService: MintService;
    private readonly channelService: ChannelService;
    private subscriberCallback: SubscriberCallback;


    constructor(@inject(TYPES.SubscriberService) subscriberService: SubscriberService,
                @inject(TYPES.MintService) mintService: MintService,
                @inject(TYPES.ChannelService) channelService: ChannelService) {
        this.channels = [];
        this.mintService = mintService;
        this.subscriberService = subscriberService;
        this.channelService = channelService;
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
            const token = await this.mintService.getTokenFromCache(tokenId);
            const account = await this.mintService.getAccountFromCache(token.owner);
            const embedToSend = MintChannelServiceImpl.getTokenEmbed(token, account);
            await channel.send(embedToSend)
        }catch (e){
            logger.error(`[MintChannelService] Executing sendMintInfoToChannel, error: ${e}`);
        }
    }

    private static getTokenEmbed(token: Token, account: Account){
        return new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`title`)
            .setDescription(`description`)

            .addField('Token', `${JSON.stringify(token.event)}`, false)


            .setTimestamp(new Date())
            .setFooter('POAP Bot', 'https://media-exp1.licdn.com/dms/image/C4E0BAQH41LILaTN3cw/company-logo_200_200/0/1561273941114?e=2159024400&v=beta&t=ty-jdXGeZd1OE4V-WQP4owQ1_qvdEzgDJq5jOUw2S-s');
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