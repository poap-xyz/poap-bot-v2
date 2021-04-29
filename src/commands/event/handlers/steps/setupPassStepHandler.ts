import {BotConfig} from "../../../../config/bot.config";
import {EventState, EventABMStep, EventABMStepId} from "../../../../interfaces/command/event/eventABM.interface";
import {Message} from "discord.js";
import {EventService} from "../../../../interfaces/services/core/eventService";
import {SetupAbstractHandler} from "./setupAbstractHandler";


export class SetupPassStepHandler extends SetupAbstractHandler{
    private readonly eventService: EventService;

    constructor(eventService: EventService) {
        super('PASS');
        this.eventService = eventService;
    }

    async sendInitMessage(eventState: EventState): Promise<Message> {
        return await eventState.dmChannel.send(`Choose secret 🔒  pass (like a word, a hash from youtube or a complete link). This pass is for your users.`);
    }

    async handler(message: Message, eventState: EventState):Promise<string> {
        const messageContent:string = message.content.trim();
        const passAvailable = await this.eventService.isPassAvailable(messageContent);

        if(!passAvailable){
            await eventState.dmChannel.send(`Please choose another secret pass. Try again 🙏`);
            return Promise.reject(`Repeated pass for event, message content: ${messageContent}`);
        }

        eventState.event.setPass(messageContent);
        return messageContent;
    }
}
