import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {Permissions, TextChannel} from "discord.js";
import {TYPES} from "../../config/types";
import {ChannelService} from "../../interfaces/services/discord/channelService";
import {SubscribedChannelService} from "../../interfaces/services/core/subscribedChannelService";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
import {logger} from "../../logger";
const { lazyInject } = getDecorators(container);

export default class SubscribeCommand extends Command{

    @lazyInject(TYPES.ChannelService) readonly channelService: ChannelService;
    @lazyInject(TYPES.SubscribedChannelService) readonly subscribedChannelService: SubscribedChannelService;
    constructor() {
        super("subscribe",
            {aliases: ["subs"],
                commandType: {DMCommand: false, GuildCommand: true},
                botPermissions: [Permissions.FLAGS.SEND_MESSAGES],
                memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]})
    }

    protected async execute(commandContext: CommandContext) {
        const message = commandContext.message;
        const subscribedChannel = this.getSubscribedChannel(commandContext);
        if(!subscribedChannel)
            return await message.reply("This channel is not supported!");

        try{
            this.subscribedChannelService.saveSubscribedChannel(subscribedChannel);
        }catch (e) {
            logger.error(`[SubscribeCommand] Subscribing error, message: ${e} (CommandContext: ${JSON.stringify(commandContext)})`);
            return await message.reply("Could not subscribe, please try again later.");
        }

        return await message.reply("Subscribed successfully!");
    }

    private getSubscribedChannel(commandContext: CommandContext){
        const message = commandContext.message;
        const channel = commandContext.message.channel;
        if(!(channel && channel instanceof TextChannel))
            return undefined;

    }
}