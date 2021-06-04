import {GuildService} from "../../interfaces/services/discord/guildService";
import {Channel, Client, DMChannel, Guild, GuildChannel, Message, Snowflake, TextChannel, User} from "discord.js";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {ChannelService} from "../../interfaces/services/discord/channelService";
import {BotConfig} from "../../config/bot.config";
import {ChannelType} from "../../interfaces/services/discord/channelService";
import {logger} from "../../logger";
import {DMChannelCallback} from "../../interfaces/callback/DMChannelCallback";

@injectable()
export class ChannelServiceImpl implements ChannelService{
    private readonly client: Client;
    private readonly guildService: GuildService;
    private usersDM: Map<Snowflake, DMChannel>;

    constructor(@inject(TYPES.Client) client: Client,
                @inject(TYPES.GuildService) guildService: GuildService) {
        this.client = client;
        this.usersDM = new Map<Snowflake, DMChannel>();
        this.guildService = guildService;
    }

    async createUserDMChannel(user: User): Promise<DMChannel>{
        let userDMChannel = this.getUserDMChannel(user);
        if(userDMChannel)
            return userDMChannel;

        try{
            userDMChannel = await user.createDM();
            this.usersDM.set(user.id, userDMChannel);
        }catch (e){
            logger.error(`[ChannelService] Error creating DM Channel for user ${user.id}, error ${e}`);
            throw new Error(e);
        }

        return userDMChannel;
    }

    getUserDMChannel(user: User): DMChannel{
        if(this.hasUserDMChannel(user))
            return this.usersDM.get(user.id);
        return undefined;
    }

    hasUserDMChannel(user: User): boolean{
        return this.usersDM.has(user.id);
    }

    async deleteUserDMChannel(user: User, reason?: string): Promise<void>{
        if(!this.hasUserDMChannel(user))
            return;

        const userDMChannel = this.getUserDMChannel(user);
        await userDMChannel.delete(reason);
        this.usersDM.delete(user.id);
    }

    async createDMChannelWithHandler(user: User, dmChannelHandler: DMChannelCallback): Promise<DMChannel>{
        if(this.hasUserDMChannel(user))
            return Promise.reject('User already has a DM Channel');

        const dmChannel = await this.createUserDMChannel(user);

        /* We set the collector to collect all the user messages */
        const collector = dmChannel.createMessageCollector((m: Message) => m.author.id === user.id, {});
        collector.on('collect', async m => {return await dmChannelHandler.DMCallback(m, user)});

        return dmChannel;
    }

    getChannelsArray(guild: Guild): string[] {
        return guild.channels.cache.map(channel => `${channel},`);
    }

    getChannelsString(guild: Guild): string {
        return this.getChannelsArray(guild).join(' ');
    }

    getMessageChannel(message: Message): ChannelType {
        if (message.channel instanceof DMChannel) {
            return 'DM_COMMAND';
        }
        if (message.guild || message.channel instanceof TextChannel) {
            return 'GUILD_COMMAND';
        }
        return 'UNKNOWN';
    }

    async getTextChannel(guildId: string, channelId: string): Promise<TextChannel>{
        const guild: Guild = await this.guildService.getGuildById(guildId);
        return guild && this.getTextChannelFromGuild(guild, channelId);
    }

    private async getTextChannelFromGuild(guild: Guild, channelId: string | Snowflake): Promise<TextChannel> {
        const channel = await this.getChannelFromGuild(guild, channelId);
        if (!(guild && channel && channel instanceof TextChannel))
            return undefined;

        return <TextChannel>channel;
    }

    private async getChannelFromGuild(guild: Guild, channelId: string | Snowflake): Promise<Channel> {
        if(!guild || !channelId)
            return undefined;

        const lowercaseChannelId = channelId.toLowerCase();
        return guild.channels.cache.find((channel => channel.id.toLowerCase() === lowercaseChannelId)) || await this.client.channels.fetch(channelId);
    }

    getChannelFromGuildByName(guild: Guild, channelName: string): GuildChannel {
        if(!guild || !channelName)
            return undefined;

        const stripChannelName = ChannelServiceImpl.stripChannel(channelName);
        return guild.channels.cache.find((channel => channel.name.toLowerCase() === stripChannelName));
    }

    private static stripChannel(channelName: string): string{
        let stripName = channelName.trim().toLowerCase();
        if(stripName.startsWith(BotConfig.channelPrefix))
            return stripName.slice(BotConfig.channelPrefix.length).trim();
        return stripName;
    }
}