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

export default class SubscribeCommand extends Command{

    @lazyInject(TYPES.ChannelService) readonly channelService: ChannelService;
    @lazyInject(TYPES.SubscribedChannelService) readonly subscribedChannelService: SubscribedChannelService;
    constructor() {
        super("subscribe",
            {aliases: ["subs"],
                commandType: {DMCommand: false, GuildCommand: true},
                botPermissions: [Permissions.FLAGS.SEND_MESSAGES],
                memberPermissions: [Permissions.FLAGS.MANAGE_GUILD]},
            3);
    }

    protected async execute(commandContext: CommandContext) {
        const message = commandContext.message;
        const channelToSubscribe = await SubscribeCommand.getSubscribedChannel(commandContext);
        if(!channelToSubscribe)
            return;

        try{
            const subscribedChannel = await this.subscribedChannelService.getSubscribedChannel(channelToSubscribe.server, channelToSubscribe.channel);
            if(subscribedChannel){
                return await message.reply("This channel is currently subscribed.");
            }

            this.subscribedChannelService.saveSubscribedChannel(channelToSubscribe);
        }catch (e) {
            logger.error(`[SubscribeCommand] Subscribing error, message: ${e} (CommandContext: ${JSON.stringify(commandContext)})`);
            return await message.reply("Could not subscribe, please try again later.");
        }

        await message.react("🙌");
    }

    private static async getSubscribedChannel(commandContext: CommandContext): Promise<SubscribedChannelInput> {
        const message = commandContext.message;
        const channel = commandContext.message.channel;
        const guild = commandContext.guild;
        if (!(channel && channel instanceof TextChannel && guild)) {
            await message.reply("This channel is not supported!");
            return undefined;
        }

        const parsedArgs = await SubscribeCommand.parseSubscribeArgs(commandContext);
        if(!parsedArgs){
            await commandContext.message.reply(`Invalid arguments, valid e.g. xDai or Mainnet`);
            return undefined;
        }

        return {
            server: guild.id,
            channel: channel.id,
            mainnet: parsedArgs.xDai,
            xDai: parsedArgs.mainnet
        }
    }

    private static async parseSubscribeArgs(commandContext) {
        //Default all true
        let xDai: boolean = true;
        let mainnet: boolean = true;

        if (commandContext.args.length > 0) {
            const arg = commandContext.args[0].toLowerCase().trim();
            if (arg === "mainnet") {
                xDai = false;
            }else if (arg === "xdai"){
                mainnet = false;
            }else {
                return undefined;
            }
        }

        return {xDai: xDai, mainnet}
    }
}
