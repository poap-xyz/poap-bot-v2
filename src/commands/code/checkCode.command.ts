import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {Message} from "discord.js";
import {TYPES} from "../../config/types";
import {EventService} from "../../interfaces/services/core/eventService";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
const { lazyInject } = getDecorators(container);
import {CodeService} from "../../interfaces/services/core/codeService";
import {ChannelService} from "../../interfaces/services/discord/channelService";
import {BotConfig} from "../../config/bot.config";
import {BotEvent} from "../../models/core/botEvent";

export default class CheckCodeCommand extends Command{
    @lazyInject(TYPES.EventService) readonly eventService: EventService;
    @lazyInject(TYPES.CodeService) readonly codeService: CodeService;
    @lazyInject(TYPES.ChannelService) readonly channelService: ChannelService;

    constructor() {
        super("code",
            {aliases: [],
                commandType: {DMCommand: true, GuildCommand: false},
                botPermissions: [],
                memberPermissions: []})
    }

    public async isCommandCalledByMessage(message: Message): Promise<boolean>{
        /* This method call is expensive so it must be last in the execution priority */
        const event = await this.eventService.getEventByPass(message.content);
        return !!event;
    }

    protected async execute(commandContext: CommandContext): Promise<Message>{
        const event = await this.eventService.getActiveEventByPass(commandContext.message.content);
        if(!event){
            return await commandContext.message.reply("Sorry the event is no longer available!");
        }

        const claimCode = await this.codeService.checkCodeForEventUsername(event.id, commandContext.message.author.id);
        if(claimCode){
            const response = CheckCodeCommand.setClaimInResponseMessage(event, claimCode);
            return await commandContext.message.reply(response);
        }

        await commandContext.message.react("🤔");
        return await commandContext.message.reply("Sorry there are no more POAPs available for this event!");
    }

    private static setClaimInResponseMessage(event: BotEvent, claimCode: string){
        let claimUrl = BotConfig.poapClaimUrl + claimCode;
        if(claimCode.indexOf("http:") !== -1)
            claimUrl = claimCode;

        return event.response_message.replace(BotConfig.responseMessageReplace, claimUrl);
    }
}
