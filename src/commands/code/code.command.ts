import {Command} from "../command";
import {CommandContext} from "../commandContext";
import {Message} from "discord.js";
import {TYPES} from "../../config/types";
import {EventService} from "../../interfaces/services/core/eventService";
import getDecorators from "inversify-inject-decorators";
import container from "../../config/inversify.config";
const { lazyInject } = getDecorators(container);
import {logger} from "../../logger";
import {CodeService} from "../../interfaces/services/core/codeService";

export default class CodeCommand extends Command{
    @lazyInject(TYPES.EventService) eventService: EventService;
    @lazyInject(TYPES.CodeService) codeService: CodeService;

    constructor() {
        super("code",
            {aliases: [],
                commandType: {DMCommand: true, GuildCommand: false},
                botPermissions: [],
                memberPermissions: []})
    }

    public async isCommandCalledByMessage(message: Message): Promise<boolean>{
        /* This method call is expensive so it must be last in the execution priority */
        const event = await this.eventService.getEventFromPass(message.content);
        return !!event;
    }

    protected async execute(commandContext: CommandContext): Promise<Message>{
        const event = await this.eventService.getEventFromPass(commandContext.message.content);
        const claimCode = this.codeService.checkCodeForEventUsername(event.id, commandContext.message.author.id);
        if(claimCode){
            const response = event.response_message.replace("{code}", claimCode);
            return await commandContext.message.reply(response);
        }

        await commandContext.message.react("🤔");
        return await commandContext.message.reply("You have already claim a POAP for this event!");
    }
}
