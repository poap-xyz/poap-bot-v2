import {BotConfig} from "../../config/bot.config";
import {SetupState, SetupStep, SetupStepId} from "../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";
import {EventService} from "../../interfaces/services/eventService";


export class SetupPassStepHandler implements SetupStep{
    readonly stepId: SetupStepId = 'RESPONSE';
    readonly eventService: EventService;

    constructor(eventService: EventService) {
        this.eventService = eventService;
    }

    async sendInitMessage(setupState: SetupState): Promise<Message> {
        return await setupState.dmChannel.send(`Choose secret 🔒  pass (like a word, a hash from youtube or a complete link). This pass is for your users.`);
    }

    async handler(messageContent: string, setupState: SetupState):Promise<string> {
        const passAvailable = await this.eventService.isPassAvailable(messageContent);

        if(!passAvailable){
            await setupState.dmChannel.send(`Please choose another secret pass. Try again 🙏`);
            return Promise.reject(`Repeated pass for event, message content: ${messageContent}`)
        }

        setupState.event.setPass(messageContent);
        return messageContent;
    }
}
