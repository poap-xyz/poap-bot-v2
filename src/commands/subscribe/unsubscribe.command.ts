import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {Permissions, TextChannel} from "discord.js";
import {TYPES} from "../../config/types";
import {ChannelService} from "../../interfaces/services/discord/channelService";
import {SubscribedChannelService} from "../../interfaces/services/core/subscribedChannelService";
import {SubscribedChannel} from "../../models/core/subscribedChannel";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
import {logger} from "../../logger";
import {SubscribedChannelInput} from "../../models/input/subscribedChannelInput";
const { lazyInject } = getDecorators(container);

export default class UnsubscribeCommand extends Command{

    @lazyInject(TYPES.ChannelService) readonly channelService: ChannelService;
    @lazyInject(TYPES.SubscribedChannelService) readonly subscribedChannelService: SubscribedChannelService;
    constructor() {
        super("unsubscribe",
            {aliases: ["unsubs"],
                commandType: {DMCommand: false, GuildCommand: true},
                botPermissions: [Permissions.FLAGS.SEND_MESSAGES],
                memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]})
    }

    protected async execute(commandContext: CommandContext) {
        const message = commandContext.message;
        const channelInfo = await UnsubscribeCommand.getChannelInfo(commandContext);
        if(!channelInfo)
            return;

        try{
            const subscribedChannel = await this.subscribedChannelService.getSubscribedChannel(channelInfo.server, channelInfo.channel);
            if(!subscribedChannel){
                return await message.reply("This channel is not subscribed currently.");
            }

            await this.subscribedChannelService.deleteSubscribedChannel(subscribedChannel);

        }catch (e) {
            logger.error(`[SubscribeCommand] Subscribing error, message: ${e} (CommandContext: ${JSON.stringify(commandContext)})`);
            return await message.reply("Could not unsubscribe, please try again later.");
        }

        await message.react("🙌");
    }

    private static async getChannelInfo(commandContext: CommandContext){
        const message = commandContext.message;
        const channel = commandContext.message.channel;
        const guild = commandContext.guild;
        if (!(channel && channel instanceof TextChannel && guild)) {
            await message.reply("This channel is not supported!");
            return undefined;
        }

        return {channel: channel.id, server: guild.id}
    }

}