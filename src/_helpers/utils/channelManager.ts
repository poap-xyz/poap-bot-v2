import {Channel, DMChannel, Guild, Message, TextChannel, User} from "discord.js";
import {BotConfig} from "../../config/bot.config";

export type ChannelType = 'DM_COMMAND' | 'GUILD_COMMAND' | 'UNKNOWN';

export class ChannelManager {

    public static getChannelFromGuild(guild: Guild, channelName: string): Channel{
        if(!guild || !channelName)
            return undefined;

        const stripChannelName = this.stripChannel(channelName);

        //TODO research this
        return guild.channels.cache.find((value => value.name.toLowerCase() === stripChannelName));
    }

    private static stripChannel(channelName: string): string{
        let stripName = channelName.trim().toLowerCase();
        if(stripName.startsWith(BotConfig.channelPrefix))
            return stripName.slice(BotConfig.channelPrefix.length).trim();
        return stripName;
    }

    public static getChannelsArray(guild: Guild): string[]{
        return guild.channels.cache.map(channel => `${channel},`);
    }

    public static getChannelsString(guild: Guild): string{
        return this.getChannelsArray(guild).join(' ');
    }

    public static getMessageChannel(message: Message): ChannelType{
        if (message.channel instanceof DMChannel) {
            return 'DM_COMMAND';
        }
        if (message.guild || message.channel instanceof TextChannel) {
            return 'GUILD_COMMAND';
        }
        return 'UNKNOWN';
    }

    public static async createDMAndAddHandler(user: User, callback: (message: Message, user: User) => Promise<Message>) {
        const dmChannel = await user.createDM();

        /* We set the collector to collect all the user messages */
        const collector = dmChannel.createMessageCollector((m: Message) => m.author.id === user.id, {});
        collector.on('collect', async m => await callback(m, user));

        return dmChannel;
    }
}
