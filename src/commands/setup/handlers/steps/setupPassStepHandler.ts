import {BotConfig} from "../../../../config/bot.config";
import {SetupState, SetupStep, SetupStepId} from "../../../../interfaces/command/setup/setup.interface";
import {Message} from "discord.js";
import {EventService} from "../../../../interfaces/services/core/eventService";
import {SetupAbstractHandler} from "./setupAbstractHandler";


export class SetupPassStepHandler extends SetupAbstractHandler{
    readonly eventService: EventService;

    constructor(eventService: EventService) {
        super('PASS');
        this.eventService = eventService;
    }

    async sendInitMessage(setupState: SetupState): Promise<Message> {
        return await setupState.dmChannel.send(`Choose secret 🔒  pass (like a word, a hash from youtube or a complete link). This pass is for your users.`);
    }

    async handler(message: Message, setupState: SetupState):Promise<string> {
        const messageContent:string = message.content.trim();
        const passAvailable = await this.eventService.isPassAvailable(messageContent);

        if(!passAvailable){
            await setupState.dmChannel.send(`Please choose another secret pass. Try again 🙏`);
            return Promise.reject(`Repeated pass for event, message content: ${messageContent}`);
        }

        setupState.event.setPass(messageContent);
        return messageContent;
    }
}
