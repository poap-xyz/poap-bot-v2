import {SubscribedChannelService} from "../../interfaces/services/core/subscribedChannelService";
import {SubscribedChannel} from "../../models/core/subscribedChannel";
import {inject, injectable} from "inversify";
import {SubscribedChannelDao} from "../../interfaces/persistence/core/subscribedChannelDao";
import {Snowflake, TextChannel} from "discord.js";
import {SubscriberService} from "../../interfaces/services/pubsub/subscriberService";
import {ChannelService} from "../../interfaces/services/discord/channelService";
import {MintSubscriberCallback} from "../../interfaces/callback/mintSubscriberCallback";
import {TokenCacheService} from "../../interfaces/services/cache/tokenCacheService";
import {AccountCacheService} from "../../interfaces/services/cache/accountCacheService";
import {MintSubscriberCallbackImpl} from "../../discord/callbacks/mintSubscriberCallbackImpl";
import {SubscribedChannelInput} from "../../models/input/subscribedChannelInput";
import {logger} from "../../logger";
import {TYPES} from "../../config/types";

@injectable()
export class SubscribedChannelServiceImpl implements SubscribedChannelService {
    private subscribedChannelDao: SubscribedChannelDao;
    private channels: TextChannel[];
    private readonly subscriberService: SubscriberService;
    private readonly channelService: ChannelService;
    private readonly tokenCacheService: TokenCacheService;
    private readonly accountCacheService: AccountCacheService;
    private readonly subscriberCallback: MintSubscriberCallback;

    constructor(@inject(TYPES.SubscriberService) subscriberService: SubscriberService,
                @inject(TYPES.ChannelService) channelService: ChannelService,
                @inject(TYPES.SubscribedChannelDao) subscribedChannelDao: SubscribedChannelDao,
                @inject(TYPES.TokenCacheService) tokenCacheService: TokenCacheService,
                @inject(TYPES.AccountCacheService) accountCacheService: AccountCacheService,) {
        this.channels = [];
        this.subscriberService = subscriberService;
        this.channelService = channelService;
        this.subscribedChannelDao = subscribedChannelDao;
        this.tokenCacheService = tokenCacheService;
        this.accountCacheService = accountCacheService;
        this.subscriberCallback = new MintSubscriberCallbackImpl(this.tokenCacheService, this.accountCacheService, this);
    }

    async initSubscribersService() {
        try {
            await this.loadChannels();
            await this.subscriberService.subscribeToTokenChannel(this.subscriberCallback);
        } catch (e) {
            logger.error(`[SubscriberChannelService] Init failed, error: ${e}`);
        }
    }

    async loadChannels() {
        const channels = await this.getAllSubscribedChannel();
        for(let i = 0; i < channels.length;i++){
            const textChannel = await this.channelService.getTextChannel(channels[i].server, channels[i].channel);
            if(textChannel) {
                this.addTextChannel(textChannel);
                logger.info(`[SubscribedChannelService] Adding to subscriber channel ${channels[i].channel} in server ${channels[i].server}`);
            }else{
                logger.error(`[SubscribedChannelService] Could not found channel ${channels[i].channel} in server ${channels[i].server}`);
            }
        }
    }

    getAllSubscribedChannel(): Promise<SubscribedChannel[]> {
        return this.subscribedChannelDao.getAllSubscribedChannel();
    }

    async saveSubscribedChannel(subscribedChannel: SubscribedChannelInput) {
        const textChannel = await this.channelService.getTextChannel(subscribedChannel.server, subscribedChannel.channel);
        if (!textChannel)
            return Promise.reject("No discord text channel found");

        const savedSubscribedChannel = await this.subscribedChannelDao.saveSubscribedChannel(subscribedChannel);
        this.addTextChannel(textChannel);

        return savedSubscribedChannel;
    }

    private addTextChannel(channel: TextChannel) {
        this.channels.push(channel);
    }

    async deleteSubscribedChannel(subscribedChannel: SubscribedChannel): Promise<void> {
        await this.subscribedChannelDao.deleteSubscribedChannel(subscribedChannel);
        this.channels = this.channels.filter((value => !(value.guild.id === subscribedChannel.server && value.id === subscribedChannel.channel)));
    }

    getAllTextChannels(): TextChannel[] {
        return [...this.channels];
    }

    getSubscribedChannel(guildId: string | Snowflake, channelId: string | Snowflake): Promise<SubscribedChannel | null> {
        return this.subscribedChannelDao.getSubscribedChannel(guildId, channelId);
    }
}