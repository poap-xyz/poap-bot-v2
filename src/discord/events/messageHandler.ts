import {Message} from "discord.js";
import {Command} from "../../commands/command";
import {inject, injectable} from "inversify";
import {TYPES} from "../../config/types";
import {CommandLoader} from "../loaders/commandLoader";
import {ChannelService} from "../../interfaces/services/discord/channelService";

@injectable()
export class MessageHandler {
    private readonly commandLoader: CommandLoader;
    private readonly channelService: ChannelService;

    constructor(@inject(TYPES.CommandLoader) commandLoader: CommandLoader,
                @inject(TYPES.ChannelService) channelService: ChannelService) {
        this.commandLoader = commandLoader;
        this.channelService = channelService;
    }

    async handle(message: Message): Promise<Message | Message[]> {
        if (message.author.bot) {
            return Promise.reject('Ignoring bot message!');
        }

        if(this.channelService.getMessageChannel(message) ==='DM_COMMAND' && this.channelService.hasUserDMChannel(message.author)){
            return Promise.reject('Ignoring DM message because already has a handler');
        }

        /* Obtain guild if not cached */
        await MessageHandler.cacheMemberOnGuild(message);

        const command = await this.getCommandByMessage(message);
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

    private async getCommandByMessage(message: Message): Promise<Command | null> {
        for (const cmd of this.commandLoader.commands) {
            if (await cmd.isCommandCalledByMessage(message))
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
