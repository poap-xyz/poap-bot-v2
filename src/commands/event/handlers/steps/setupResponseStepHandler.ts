import {BotConfig} from "../../../../config/bot.config";
import {EventState, EventABMStep, EventABMStepId} from "../../../../interfaces/command/event/eventABM.interface";
import {Message} from "discord.js";
import {SetupAbstractHandler} from "./setupAbstractHandler";


export class SetupResponseStepHandler extends SetupAbstractHandler{
    constructor() {
        super('RESPONSE');
    }

    async sendInitMessage(eventState: EventState): Promise<Message> {
        return await eventState.dmChannel.send(`Response to send privately to members during the event? (${BotConfig.defaultResponseMessage})`);
    }

    async handler(message: Message, eventState: EventState):Promise<string> {
        const messageContent: string = message.content.trim();
        let responseMessage: string;

        if (messageContent === BotConfig.defaultOptionMessage){
            responseMessage = eventState.event.responseMessage ? eventState.event.responseMessage : BotConfig.defaultResponseMessage;
        }else{
            if(messageContent && messageContent.length){
                responseMessage = messageContent;
            }

            if(!(responseMessage && responseMessage.indexOf(BotConfig.responseMessageReplace) !== -1)){
                await eventState.dmChannel.send(`Please provide a response containing the {code} word or send '-' for default`);
                return Promise.reject("Invalid response (null or empty)");
            }
        }


        eventState.event.setResponseMessage(responseMessage);
        return responseMessage;
    }
}
