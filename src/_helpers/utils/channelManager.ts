import {Channel, DMChannel, Guild, Message, TextChannel} from "discord.js";
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

    public static getChannelsString(guild: Guild): string{
        return guild.channels.cache.map(channel => `${channel},`).join(' ');
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
}
