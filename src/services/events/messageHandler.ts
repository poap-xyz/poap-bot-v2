import {Message} from "discord.js";
import {Command} from "../../commands/command";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {CommandLoader} from "../loaders/commandLoader";
import * as pino from "pino";

@injectable()
export class MessageHandler {
    private readonly commandLoader: CommandLoader;

    constructor(@inject(TYPES.CommandLoader) commandLoader: CommandLoader) {
        this.commandLoader = commandLoader;
    }

    async handle(message: Message): Promise<Message | Message[]> {
        if (message.author.bot) {
            return Promise.reject('Ignoring bot message!');
        }

        /* Obtain guild if not cached */
        await MessageHandler.cacheMemberOnGuild(message);

        const command = this.getCommandByMessage(message);
        if(command){
            try {
                return command.run(message);
            }catch (e){
                console.log(e); //TODO remove this line
                return Promise.reject(e);
            }
        }

        return Promise.reject("No command matched by message");
    }

    private getCommandByMessage(message: Message): Command | null{
        for (const [name, cmd] of this.commandLoader.commands) {
            if(cmd.isCommandCalledByMessage(message))
                return cmd;
        }
        return null;
    }

    /* Fetch member if not cached, if the member on a guild is invisible or not cached */
    private static async cacheMemberOnGuild(message: Message) {
        if (message.guild && !message.member) {
            await message.guild.members.fetch(message.author.id);
        }
    }
}
