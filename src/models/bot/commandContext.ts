/* https://github.com/hopskipnfall/discord-typescript-bot/blob/master/src/models/command_context.ts */
import {Message} from "discord.js";
import {inject} from "inversify";
import {BotConfig} from "../../config/bot.config";

export class CommandContext {
    /** Command name in all lowercase. */
    readonly parsedCommandName: string;

    /** Arguments (split by space). */
    readonly args: string[];

    /** Original Message the command was extracted from. */
    readonly originalMessage: Message;

    readonly commandPrefix: string;

    constructor(message: Message) {
        this.commandPrefix = BotConfig.prefix;
        const splitMessage = message.content
            .slice(this.commandPrefix.length)
            .trim()
            .split(/ +/g);

        this.parsedCommandName = splitMessage.shift()!.toLowerCase();
        this.args = splitMessage;
        this.originalMessage = message;
    }
}