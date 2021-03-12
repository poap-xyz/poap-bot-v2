import {DMChannel, Message} from "discord.js";

export type CommandChannelType = 'DM_COMMAND' | 'GUILD_COMMAND' | 'UNKNOWN';

export class CommandChannel {
    public static getCommandType(message: Message): CommandChannelType{
        if (message.channel instanceof DMChannel) {
            return 'DM_COMMAND';
        }
        if (message.guild) {
            return 'GUILD_COMMAND';
        }
        return 'UNKNOWN';
    }
}