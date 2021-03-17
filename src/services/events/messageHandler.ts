import {Message} from "discord.js";
import {Command} from "../../commands/command";
import container from "../../config/inversify.config";
import {inject, injectable} from "inversify";
import getDecorators from "inversify-inject-decorators";
const { lazyInject } = getDecorators(container);

import {TYPES} from "../../config/types";
import {Bot} from "../../bot";


@injectable()
export class MessageHandler {
    @lazyInject(TYPES.Bot) private bot: Bot;
    constructor() {
    }

    async handle(message: Message): Promise<Message | Message[]> {
        if (message.author.bot) {
            console.log('Ignoring bot message!')
            return;
        }
        /* Obtain guild if not cached */
        await MessageHandler.cacheMemberOnGuild(message);

        const command = this.getCommandByMessage(message);
        if(command){
            try {
                return await command.run(message);
            }catch (e){
                return Promise.reject(e);
            }
        }

        return Promise.reject();
    }

    private getCommandByMessage(message: Message): Command | null{
        for (const [name, cmd] of this.bot.commands) {
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
