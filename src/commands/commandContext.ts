/* https://github.com/hopskipnfall/discord-typescript-bot/blob/master/src/models/command_context.ts */
import {Guild, Message, User} from "discord.js";
import {inject} from "inversify";
import {BotConfig} from "../config/bot.config";
import {PermissionManager, PermissionStatus} from "../_helpers/utils/permissionManager";
import {Command} from "./command";
import {CommandOptions} from "../interfaces/command/commandOptions";
import {ChannelService} from "../interfaces/services/discord/channelService";

export class CommandContext {
    /** Command name in all lowercase or null if prefix is not correct */
    readonly commandName: string;

    /** Command name in all lowercase or null if prefix is not correct */
    readonly parsedCommandName: string | null;

    /** Arguments (split by space). */
    readonly args: string[];

    /** Original Message the command was extracted from. */
    readonly message: Message;

    readonly commandPrefix: string;

    readonly commandOptions: CommandOptions;

    readonly guild: Guild | null;

    constructor(message: Message, commandName: string, commandOptions: CommandOptions) {
        this.message = message;
        this.guild = message.guild;
        this.commandName = commandName.toLowerCase();
        this.commandOptions = commandOptions;
        this.commandPrefix = BotConfig.prefix;
        this.parsedCommandName = null;
        this.args = [];

        const messageWithoutPrefix = CommandContext.stripPrefixAndTrimMessage(message, BotConfig.prefix);
        if(messageWithoutPrefix) {
            const splitMessage = CommandContext.splitSpacesFromString(messageWithoutPrefix);
            this.parsedCommandName = splitMessage.shift()!.toLowerCase();
            this.args = splitMessage;
        }
    }

    private static stripPrefixAndTrimMessage(message: Message, botCommandPrefix: string): string | null{
        const messageContentTrimmed = this.splitSpacesFromString(message.content).join(' ').toLowerCase();
        const messagePrefix = this.getMessagePrefix(messageContentTrimmed, botCommandPrefix, message.client.user);
        if(!messagePrefix)
            return null;

        return messageContentTrimmed.slice(messagePrefix.length);
    }

    private static getMessagePrefix(messageTrimmed: string, botCommandPrefix: string, client: User){
        const commonPrefixes = [
            `${botCommandPrefix}`,
            `<@!${client.id}> ${botCommandPrefix}`,
            `<@${client.id}> ${botCommandPrefix}`,
            `${client.username.toLowerCase()} ${botCommandPrefix}`,
        ];

        let matchedPrefix = null;
        commonPrefixes.forEach((prefix) => {
            if(messageTrimmed.startsWith(prefix))
                matchedPrefix = prefix;
        });

        return matchedPrefix;
    }

    private static splitSpacesFromString(str: string): string[]{
        return str.trim().split(/ +/g);
    }

    public isCommandCalledByMessage(){
        if(this.commandName === this.parsedCommandName){
            return true;
        }

        /* Aliases check */
        return !!this.findAlias(this.parsedCommandName, this.commandOptions.aliases);
    }

    private findAlias(parsedCommandName: string, aliases: string[]){
        return aliases.find((alias) => (alias.toLowerCase() === parsedCommandName));
    }

    public getCommandPermissions(): PermissionStatus{
        return PermissionManager.checkPermissions(this.message, this.commandOptions);
    }

    public hasPermissionToRun(): boolean{
        return this.getCommandPermissions().permissionType === "PERMISSION_OK";
    }
}
