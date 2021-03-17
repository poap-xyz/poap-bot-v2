import {DMChannel, GuildChannel, Message, TextChannel} from "discord.js";

export type ChannelType = 'DM_COMMAND' | 'GUILD_COMMAND' | 'UNKNOWN';

export class MessageChannelHandler {
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
