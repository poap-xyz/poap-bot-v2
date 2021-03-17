/* https://github.com/hopskipnfall/discord-typescript-bot/blob/master/src/models/command_context.ts */
import {Message} from "discord.js";
import {inject} from "inversify";
import {BotConfig} from "../config/bot.config";
import {PermissionManager, PermissionStatus} from "../_helpers/commandUtils/permissionManager";
import {Command} from "./command";
import {CommandOptions} from "./commandOptions";

export class CommandContext {
    readonly commandName: string;
    /** Command name in all lowercase or null if prefix is not correct */
    readonly parsedCommandName: string | null;

    /** Arguments (split by space). */
    readonly args: string[];

    /** Original Message the command was extracted from. */
    readonly originalMessage: Message;

    readonly commandPrefix: string;

    readonly commandOptions: CommandOptions;

    constructor(message: Message, commandName: string, commandOptions: CommandOptions) {
        this.originalMessage = message;
        this.commandName = commandName.toLowerCase();
        this.commandOptions = commandOptions;
        this.commandPrefix = BotConfig.prefix;
        this.parsedCommandName = null;
        this.args = [];

        const prefixMessage = CommandContext.getPrefixFromMessage(message, this.commandPrefix);
        if(prefixMessage === this.commandPrefix){
            const splitMessage = CommandContext.splitSpacesFromMessage(message, this.commandPrefix);
            this.parsedCommandName = splitMessage.shift()!.toLowerCase();
            this.args = splitMessage;
        }
    }

    private static getPrefixFromMessage(message: Message, commandPrefix: string): string{
        return message.content.slice(0, commandPrefix.length);
    }

    private static splitSpacesFromMessage(message: Message, commandPrefix: string): string[]{
        return message.content.slice(commandPrefix.length).trim().split(/ +/g);
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
        return PermissionManager.checkPermissions(this.originalMessage, this.commandOptions);
    }

    public hasPermissionToRun(): boolean{
        return this.getCommandPermissions().permissionType === "PERMISSION_OK";
    }
}
